import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import AuthService from '../services/user.service';

const lowercaseMessage = 'Password must contain at least one lowercase letter';
const uppercaseMessage = 'Password must contain at least one uppercase letter';
const numberMessage = 'Password must contain at least one number';
const specialCharMessage = 'Password must contain at least one special character';

interface SignupFormValues {
  email: string;
  password: string;
}

const Signup = () => {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(40, 'Password must be at most 40 characters')
      .matches(/[a-z]/, lowercaseMessage)
      .matches(/[A-Z]/, uppercaseMessage)
      .matches(/[0-9]/, numberMessage)
      .matches(/[@$!%*?&]/, specialCharMessage)
      .required('Password is required'),
  });

  const [message, setMessage] = useState<string>('');
  const [successful, setSuccessful] = useState<boolean>(false);

  const handleSignup = async (
    values: SignupFormValues
  ) => {
    setMessage('');
    setSuccessful(false);

    AuthService.signup(values).then(
      (response) => {
        setMessage(response.data.message || '');
        setSuccessful(true);
        navigate('/signin');
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setSuccessful(false);
      }
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Sign Up</h3>
            </div>
            <div className="card-body">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSignup}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {!successful && (
                      <div>
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <Field
                            type="text"
                            className="form-control"
                            name="email"
                          />
                          <ErrorMessage
                            component="div"
                            name="email"
                            className="alert alert-danger mt-2"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <Field
                            type="password"
                            className="form-control"
                            name="password"
                          />
                          <ErrorMessage
                            component="div"
                            name="password"
                            className="alert alert-danger mt-2"
                          />
                        </div>

                        <div className="mb-3">
                          <button
                            className="btn btn-primary btn-block"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>Sign Up</span>
                          </button>
                        </div>

                        <div className="mb-3">
                          <Link to="/signin">Have an account? Sign In!</Link>
                        </div>
                      </div>
                    )}

                    {message && (
                      <div className="mb-3">
                        <div
                          className={
                            successful
                              ? 'alert alert-success'
                              : 'alert alert-danger'
                          }
                          role="alert"
                        >
                          {message}
                        </div>
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
