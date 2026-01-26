/**
 * Query optimization utilities
 * Provides helper functions for common query patterns
 */

/**
 * Build tenant-scoped query
 * Ensures all queries are properly scoped to tenant
 * @param {Object} baseQuery - Base query object
 * @param {Object} tenant - Tenant information from middleware
 * @returns {Object} Tenant-scoped query
 */
export const buildTenantQuery = (baseQuery = {}, tenant) => {
  if (!tenant || !tenant.tenantId || !tenant.organizationId) {
    throw new Error('Tenant information is required for query scoping');
  }

  return {
    ...baseQuery,
    tenantId: tenant.tenantId,
    organizationId: tenant.organizationId,
  };
};

/**
 * Build pagination options
 * @param {Object} queryParams - Request query parameters
 * @param {Object} defaults - Default pagination values
 * @returns {Object} Pagination options with limit and skip
 */
export const buildPagination = (queryParams = {}, defaults = { page: 1, limit: 20 }) => {
  const page = Math.max(1, parseInt(queryParams.page || defaults.page, 10));
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit || defaults.limit, 10)));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * Build sort options
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc/desc)
 * @param {string} defaultSort - Default sort field
 * @returns {Object} Sort object for Mongoose
 */
export const buildSort = (sortBy, sortOrder = 'desc', defaultSort = 'createdAt') => {
  const field = sortBy || defaultSort;
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  
  return {
    [field]: order,
  };
};

/**
 * Optimize query with select, populate, and lean options
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized query
 */
export const optimizeQuery = (query, options = {}) => {
  const {
    select,
    populate,
    lean = false, // Use lean() for read-only queries in production
    limit,
    skip,
    sort,
  } = options;

  if (select) {
    query.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        if (typeof pop === 'string') {
          query.populate(pop);
        } else {
          query.populate(pop.path, pop.select);
        }
      });
    } else {
      query.populate(populate);
    }
  }

  if (sort) {
    query.sort(sort);
  }

  if (skip !== undefined) {
    query.skip(skip);
  }

  if (limit !== undefined) {
    query.limit(limit);
  }

  // Use lean() for read-only queries to improve performance
  // Lean documents are plain JavaScript objects, not Mongoose documents
  if (lean && process.env.NODE_ENV === 'production') {
    query.lean();
  }

  return query;
};

/**
 * Execute query with error handling and logging
 * @param {Function} queryFn - Query function to execute
 * @param {string} operation - Operation name for logging
 * @returns {Promise} Query result
 */
export const executeQuery = async (queryFn, operation = 'query') => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    // Log slow queries in production
    if (process.env.NODE_ENV === 'production' && duration > 1000) {
      console.warn(`Slow query detected: ${operation} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Query error in ${operation} after ${duration}ms:`, error.message);
    throw error;
  }
};
