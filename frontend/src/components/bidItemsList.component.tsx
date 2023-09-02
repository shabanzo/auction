import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useLocation } from 'react-router-dom';

import { Item } from '../services/interface';
import itemService from '../services/item.service';

const BidItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const initialPage: number = parseInt(urlSearchParams.get('page') || '1', 10) - 1;

  useEffect(() => {
    const fetchData = async () => {
      const paginatedItems = await itemService.getBidItems(currentPage);
      setItems(paginatedItems.items);
      setPageCount(paginatedItems.totalPages);
    };

    fetchData();
  }, [currentPage]);

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleBid = (itemId: number) => {
    // Implement the bid action for the given item
    // You can navigate to a bidding page or perform any necessary logic here
    alert(`Bid on item with ID ${itemId}`);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">Bidding Items List</h1>
          <Table bordered striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Current Price</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: Item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.startingPrice}</td>
                  <td>{item.timeWindowHours}</td>
                  <td>
                    <Button variant="info" onClick={() => handleBid(item.id)}>
                      Bid
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs="auto">
          <ReactPaginate
            pageCount={pageCount}
            onPageChange={handlePageClick}
            initialPage={initialPage}
            previousLabel="Previous"
            nextLabel="Next"
            breakLabel="..."
            containerClassName="pagination"
            activeClassName="active"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            nextClassName="page-item"
            previousLinkClassName="page-link"
            nextLinkClassName="page-link"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default BidItemsList;
