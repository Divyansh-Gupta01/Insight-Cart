import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/** Returns the current URL's query string as a URLSearchParams-derived plain object helper. */
const useQueryParams = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export default useQueryParams;
