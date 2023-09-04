import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';

import { useError } from '../contexts/error.context';
import { useSuccess } from '../contexts/success.context';
import bidService from '../services/bid.service';
import { Item } from '../services/interface';
import itemService from '../services/item.service';
import userService from '../services/user.service';
import BidModal from './bidModal.component';
import CountdownTimer from './countdownTimer.component';

const BidItemsList: React.FC = () => {
  const navigate = useNavigate();
  const { addError } = useError();
  const { addSuccess } = useSuccess();
  const [items, setItems] = useState<Item[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const initialPage: number =
    parseInt(urlSearchParams.get('page') || '1', 10) - 1;

  const fetchData = async () => {
    try {
      const response = await itemService.getBidItems(currentPage, completed);
      setItems(response.data.items);
      setPageCount(response.data.totalPages);
    } catch (error: AxiosError | any) {
      if (error.response.status == 401) {
        userService.signout();
        navigate('/signin');
        addError("You're not authorized or you token has been expired!");
        window.location.reload();
      } else {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        addError(resMessage);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, completed]);

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleBid = async (itemId: number, amount: string) => {
    try {
      const response = await bidService.bid(itemId, amount);
      const bid = response.data;
      const item = bid.item;
      fetchData();
      setSelectedItem(null);
      addSuccess(
        `Your bid for ${item.name} with ${amount} has been submitted!`,
      );
    } catch (error: AxiosError | any) {
      if (error.response.status == 401) {
        userService.signout();
        navigate('/signin');
        addError("You're not authorized or you token has been expired!");
        window.location.reload();
      } else {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        addError(resMessage);
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">Bid Items List</h1>
          <Button
            className="mb-4"
            variant="success"
            onClick={() => setCompleted(false)}
          >
            Ongoing
          </Button>
          <Button
            className="mb-4"
            variant="success"
            onClick={() => setCompleted(true)}
          >
            Completed
          </Button>
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
              {items.map((item: Item) => {
                const now = new Date().getTime();
                const endTime =
                  new Date(item.publishedAt).getTime() +
                  item.timeWindowHours * 60 * 60 * 1000;
                const remainingTime = Math.max(0, endTime - now);

                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.currentPrice}</td>
                    <td>
                      {remainingTime > 0 ? (
                        <CountdownTimer remainingTime={remainingTime} />
                      ) : (
                        'Completed'
                      )}
                    </td>
                    <td>
                      <Button
                        variant="info"
                        onClick={() => setSelectedItem(item)}
                      >
                        Bid
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
      {selectedItem && (
        <BidModal
          item={selectedItem}
          show={!!selectedItem}
          onHide={() => setSelectedItem(null)}
          onSubmit={handleBid}
        />
      )}
    </Container>
  );
};

export default BidItemsList;
