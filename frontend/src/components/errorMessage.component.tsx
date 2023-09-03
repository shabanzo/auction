import React, { useEffect, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';

import { useError } from '../contexts/error.context';

const ErrorMessage = () => {
  const { errors, clearErrors } = useError();
  const [show, setShow] = useState(false);

  const closeAlert = () => {
    setShow(false);
    clearErrors();
  };

  useEffect(() => {
    if (errors.length > 0) {
      setShow(true);
    }
  }, [errors]);

  return show ? (
    <Container>
      <Alert
        variant={'danger'}
        onClose={() => closeAlert()}
        className="pt-4"
        dismissible
      >
        <ul>
          {Array.from(errors).map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>
    </Container>
  ) : (
    <></>
  );
};

export default ErrorMessage;
