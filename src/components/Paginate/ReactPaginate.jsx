import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';

function Pagination({ items, itemsPerPage, onPageChange }) {
    const [currentItems, setCurrentItems] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);

    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentItems(items.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(items.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, items]);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % items.length;
        setItemOffset(newOffset);
        onPageChange(items.slice(newOffset, newOffset + itemsPerPage));
    };

    return (
        <>
            <div className="items">
                {currentItems.map((item, index) => (
                    <div key={index}>
                        <h3>Item #{item}</h3>
                    </div>
                ))}
            </div>
            <ReactPaginate
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={50}
                previousLabel="< previous"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                renderOnZeroPageCount={null}
            />
        </>
    );
}

export default Pagination;
