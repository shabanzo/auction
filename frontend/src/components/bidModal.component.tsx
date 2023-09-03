import { Field, Form as FormikForm, Formik } from 'formik';
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import * as Yup from 'yup';

import { Item } from '../services/interface';

interface BidModalProps {
  item: Item;
  show: boolean;
  onHide: () => void;
  onSubmit: (itemId: number, amount: string) => void;
}

const BidModal: React.FC<BidModalProps> = ({
  show,
  item,
  onHide,
  onSubmit,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Place a Bid</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={{
            bidAmount: '',
          }}
          validationSchema={Yup.object().shape({
            bidAmount: Yup.number()
              .required('Bid amount is required')
              .positive('Bid amount must be a positive number')
              .min(1, 'Bid amount must be greater than or equal to 1'),
          })}
          onSubmit={(values) => {
            onSubmit(item.id, values.bidAmount);
            onHide();
          }}
        >
          {({ errors, touched }) => (
            <FormikForm>
              <Form.Group className="mb-2" controlId="bidAmount">
                <Form.Label>
                  Bid Amount (currentPrice: {item.currentPrice})
                </Form.Label>
                <Field
                  type="number"
                  name="bidAmount"
                  as={Form.Control}
                  isInvalid={errors.bidAmount && touched.bidAmount}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.bidAmount}
                </Form.Control.Feedback>
              </Form.Group>

              <Button variant="primary" type="submit">
                Place Bid
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default BidModal;
