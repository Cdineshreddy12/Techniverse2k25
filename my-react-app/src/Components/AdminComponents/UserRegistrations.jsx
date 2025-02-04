import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useRegistrations = (filters) => {
  const fetchRegistrations = async ({ pageParam = 1 }) => {
    const queryParams = new URLSearchParams({
      page: pageParam.toString(),
      pageSize: '50',
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      search: filters.searchTerm,
      paymentStatus: filters.paymentStatus,
      package: filters.package,
      branch: filters.branch,
      startDate: filters.startDate,
      endDate: filters.endDate
    });

    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/api/registrations-preview?${queryParams}`
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch registrations');
    }

    if (!data.data?.registrations || !Array.isArray(data.data.registrations)) {
      throw new Error('Invalid registration data received');
    }

    return {
      registrations: data.data.registrations,
      nextPage: pageParam + 1,
      totalPages: data.data.pagination.totalPages,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['registrations', filters],
    queryFn: fetchRegistrations,
    getNextPageParam: (lastPage, pages) => 
      lastPage.nextPage <= lastPage.totalPages ? lastPage.nextPage : undefined,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
    refetchOnMount: false, // Don't automatically refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const registrations = data?.pages.flatMap(page => page.registrations) ?? [];

  return {
    registrations,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
};

export const useRegistrationStats = () => {
  return useQuery({
    queryKey: ['registrationStats'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/registration-stats`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch registration stats');
        }
        
        if (!data.stats) {
          throw new Error('No statistics data received');
        }

        return {
          totalRegistrations: data.stats.totalRegistrations || 0,
          totalRevenue: data.stats.totalRevenue || 0,
          completedPayments: data.stats.completedPayments || 0,
          pendingPayments: data.stats.pendingPayments || 0,
          packageDistribution: data.stats.packageDistribution || [],
          recentRegistrations: data.stats.recentRegistrations || []
        };
      } catch (error) {
        console.error('Stats fetch error:', error);
        return {
          totalRegistrations: 0,
          totalRevenue: 0,
          completedPayments: 0,
          pendingPayments: 0,
          packageDistribution: [],
          recentRegistrations: []
        };
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Registration stats error:', error);
    }
  });
};  