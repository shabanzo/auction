import { AxiosError } from 'axios';
// ItemsList.tsx
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';

import { useError } from '../contexts/error.context';
import { useSuccess } from '../contexts/success.context';
import { Item, ItemLite } from '../services/interface';
import ItemService from '../services/item.service';
import userService from '../services/user.service';
import { FormatLocalTime } from '../utils/time';
import { CreateItemModal } from './createItemModal.component';

const ItemsList: React.FC = () => {
  const navigate = useNavigate();
  const { addError } = useError();
  const { addSuccess } = useSuccess();
  const [items, setItems] = useState<Item[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const initialPage: number =
    parseInt(urlSearchParams.get('page') || '1', 10) - 1;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const response = await ItemService.getMine(currentPage);
      setItems(response.data.items);
      setPageCount(response.data.totalPages);
    } catch (error: AxiosError | any) {
      if (error.response.status == 401) {
        userService.signout();
        navigate('/signin');
        addError("You're not authorized or you token has been expired!");
        window.location.reload();
      }
    }
  };

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const handlePublish = async (itemId: number) => {
    try {
      const response = await ItemService.publish(itemId);
      const item = response.data;
      fetchData();
      addSuccess(`${item.name} has been published`);
    } catch (error: AxiosError | any) {
      addError(error.message);
    }
  };

  const handleCreateItem = async (values: ItemLite) => {
    try {
      const response = await ItemService.create(values);
      const item = response.data;
      fetchData();
      setShowCreateModal(false);
      addSuccess(`${item.name} has been created`);
    } catch (error: AxiosError | any) {
      addError(error.message);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">Items List</h1>
          <Button
            className="mb-4"
            variant="success"
            onClick={() => setShowCreateModal(true)}
          >
            Create Item
          </Button>
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
                      <td>
                        {item.publishedAt && FormatLocalTime(item.publishedAt)}
                      </td>
                      <td>
                        <Button
                          disabled={!!item.publishedAt}
                          variant="primary"
                          onClick={() => handlePublish(item.id)}
                        >
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
      <CreateItemModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateItem}
      />
    </Container>
  );
};

export default ItemsList;
