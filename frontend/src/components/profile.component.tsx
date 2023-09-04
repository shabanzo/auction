import { AxiosError } from 'axios';
import { ErrorMessage, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import * as Yup from 'yup';

import { useError } from '../contexts/error.context';
import { useSuccess } from '../contexts/success.context';
import { User } from '../services/interface';
import userService from '../services/user.service';

const depositValidationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Please enter a valid number')
    .positive('Please enter a positive amount')
    .required('Amount is required'),
});

interface DepositFormValues {
  amount: number;
}

const Profile = () => {
  const { addError } = useError();
  const { addSuccess } = useSuccess();
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleModalClose = () => {
    setShowDepositModal(false);
  };

  const handleShowDepositModal = () => {
    setShowDepositModal(true);
  };

  const handleConfirmDeposit = async (values: DepositFormValues) => {
    try {
      await userService.deposit(values.amount).then(() => {
        const updatedUser = userService.getCurrentUser();
        setUser(updatedUser);
      });
      setShowDepositModal(false);
      addSuccess(`Added ${values.amount} to your account!`);
    } catch (error: AxiosError | any) {
      addError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h3>Profile</h3>
            </Card.Header>
            <Card.Body>
              <div className="form-group">
                <label>Email:</label>
                <p>{user && user.email}</p>
              </div>
              <div className="form-group">
                <label>Wallet Balance:</label>
                <p>${user && user.walletBalance}</p>
              </div>
              <Button variant="primary" onClick={handleShowDepositModal}>
                Deposit
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Modal show={showDepositModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Deposit Funds</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ amount: 0 }}
          validationSchema={depositValidationSchema}
          onSubmit={handleConfirmDeposit}
        >
          {({ values, handleChange, errors, touched }) => (
            <Form>
              <Modal.Body>
                <div className="form-group">
                  <label>Amount:</label>
                  <input
                    type="number"
                    name="amount"
                    className={`form-control ${
                      errors.amount && touched.amount ? 'is-invalid' : ''
                    }`}
                    value={values.amount}
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Deposit
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Profile;
