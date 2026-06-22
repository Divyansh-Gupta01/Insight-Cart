import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

/**
 * Fetch all products from the API.
 * Uses fakestoreapi.com by default (see services/api.js) — swap baseURL
 * via VITE_API_BASE_URL to point at a real catalog service.
 */
export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products');
    // Normalize shape to what the UI expects
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.image,
      rating: p.rating?.rate || 4.2,
      ratingCount: p.rating?.count || 0,
      stock: 25,
    }));
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return {
        id: data.id,
        title: data.title,
        price: data.price,
        category: data.category,
        description: data.description,
        image: data.image,
        rating: data.rating?.rate || 4.2,
        ratingCount: data.rating?.count || 0,
        stock: 25,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  status: 'idle',
  error: null,
  selectedProduct: null,
  selectedStatus: 'idle',
  filters: {
    category: 'all',
    minPrice: 0,
    maxPrice: 200000,
    minRating: 0,
    sortBy: 'relevance', // relevance | priceLowHigh | priceHighLow | rating
  },
  searchQuery: '',
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setPriceFilter: (state, action) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
    },
    setRatingFilter: (state, action) => {
      state.filters.minRating = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setCategoryFilter,
  setPriceFilter,
  setRatingFilter,
  setSortBy,
  setSearchQuery,
  resetFilters,
} = productSlice.actions;

// Derived selector: applies search, filters, and sorting
export const selectVisibleProducts = (state) => {
  const { list, filters, searchQuery } = state.products;
  let result = [...list];

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if (filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category);
  }
  result = result.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);
  result = result.filter((p) => p.rating >= filters.minRating);

  switch (filters.sortBy) {
    case 'priceLowHigh':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'priceHighLow':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }
  return result;
};

export const selectAllCategories = (state) => [...new Set(state.products.list.map((p) => p.category))];

export default productSlice.reducer;
