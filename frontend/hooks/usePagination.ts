import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export const usePagination = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      startIndex,
      endIndex: startIndex + itemsPerPage,
      totalPages
    };
  }, [currentPage, itemsPerPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Generar array de páginas para mostrar en la UI
  const getVisiblePages = useCallback((maxVisible = 5) => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajustar el inicio si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Agregar primera página y puntos suspensivos si es necesario
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Agregar páginas visibles
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Agregar última página y puntos suspensivos si es necesario
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // Estados
    currentPage,
    totalPages,
    itemsPerPage,

    // Información de paginación
    paginatedItems,

    // Navegación
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,

    // Utilidades
    getVisiblePages,

    // Estados booleanos
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};