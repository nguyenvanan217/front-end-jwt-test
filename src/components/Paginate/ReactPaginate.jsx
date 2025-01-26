import React from 'react';
import ReactPaginate from 'react-paginate';

function Pagination({ pageCount, currentPage, onPageChange, customStyles }) {
    return (
        <ReactPaginate
            nextLabel="Sau >"
            onPageChange={onPageChange}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel="< Trước"
            pageClassName={customStyles.pageItem}
            pageLinkClassName={customStyles.pageLink}
            previousClassName={`${customStyles.pageItem} ${currentPage === 1 ? customStyles.disabled : ''}`}
            previousLinkClassName={customStyles.pageLink}
            nextClassName={`${customStyles.pageItem} ${currentPage === pageCount ? customStyles.disabled : ''}`}
            nextLinkClassName={customStyles.pageLink}
            breakLabel="..."
            breakClassName={`${customStyles.pageItem} ${customStyles.break}`}
            breakLinkClassName={customStyles.pageLink}
            containerClassName={customStyles.pagination}
            activeClassName={customStyles.active}
            renderOnZeroPageCount={null}
            forcePage={currentPage - 1}
        />
    );
}

export default Pagination;
