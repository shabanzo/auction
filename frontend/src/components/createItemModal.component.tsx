import { Field, Form as FormikForm, Formik } from 'formik';
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import * as Yup from 'yup';

import { ItemLite } from '../services/interface';

interface CreateItemModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (values: ItemLite) => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  show,
  onHide,
  onSubmit,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Create Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={{
            name: '',
            startingPrice: 0,
            timeWindowHours: 0,
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            startingPrice: Yup.number().required('Starting Price is required'),
            timeWindowHours: Yup.number()
              .required('Time Window (Hours) is required')
              .positive('Time Window (Hours) must be a positive number')
              .integer('Time Window (Hours) must be an integer'),
          })}
          onSubmit={(values) => {
            onSubmit(values);
            onHide();
          }}
        >
          {({ errors, touched }) => (
            <FormikForm>
              <Form.Group className="mb-2" controlId="name">
                <Form.Label>Name</Form.Label>
                <Field
                  type="text"
                  name="name"
                  as={Form.Control}
                  isInvalid={errors.name && touched.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="startingPrice">
                <Form.Label>Starting Price</Form.Label>
                <Field
                  type="number"
                  name="startingPrice"
                  as={Form.Control}
                  isInvalid={errors.startingPrice && touched.startingPrice}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startingPrice}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="timeWindowHours">
                <Form.Label>Time Window (Hours)</Form.Label>
                <Field
                  type="number"
                  name="timeWindowHours"
                  as={Form.Control}
                  isInvalid={errors.timeWindowHours && touched.timeWindowHours}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.timeWindowHours}
                </Form.Control.Feedback>
              </Form.Group>

              <Button variant="primary" type="submit">
                Create
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default CreateItemModal;
