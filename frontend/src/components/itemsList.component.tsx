import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useLocation } from 'react-router-dom';

import { Item } from '../services/interface';
import itemService from '../services/item.service';
import { FormatLocalTime } from '../utils/time';

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const initialPage: number = parseInt(urlSearchParams.get('page') || '1', 10) - 1;

  useEffect(() => {
    const fetchData = async () => {
      const paginatedItems = await itemService.getMine(currentPage);
      setItems(paginatedItems.items);
      setPageCount(paginatedItems.totalPages);
    };

    fetchData();
  }, [currentPage]);

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const handlePublish = (itemId: number) => {
    // Implement the publish action for the given item
    // You can make an API call or perform any necessary logic here
    alert(`Publish item with ID ${itemId}`);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">Items List</h1>
          {items.length === 0 ? (
            <p>No items to display.</p>
          ) : (
            <>
              <Table bordered striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Starting Price</th>
                    <th>Current Price</th>
                    <th>Time Window (Hours)</th>
                    <th>PublishedAt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: Item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.startingPrice}</td>
                      <td>{item.currentPrice}</td>
                      <td>{item.timeWindowHours}</td>
                      <td>{item.publishedAt && FormatLocalTime(item.publishedAt)}</td>
                      <td>
                        <Button disabled={ !!item.publishedAt }  variant="primary" onClick={() => handlePublish(item.id)}>
                          Publish
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ItemsList;
