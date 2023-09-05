import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import UserService from '../services/user.service';

const validationSchema = Yup.object().shape({
  email: Yup.string().required('Email is required'),
  password: Yup.string().required('Password is required'),
});

interface SigninFormValues {
  email: string;
  password: string;
}

const Signin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSignin = async (values: SigninFormValues) => {
    setMessage('');
    setLoading(true);

    try {
      await UserService.signin(values).then((response) => {
        if (response && response.status === 200) {
          navigate('/profile');
          window.location.reload();
          UserService.updateCurrentUser();
        }
      });
    } catch (error: any) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Sign In</h3>
            </div>
            <div className="card-body">
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSignin}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <Field
                        type="text"
                        name="email"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="alert alert-danger mt-2"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="alert alert-danger mt-2"
                      />
                    </div>

                    <div className="mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading || isSubmitting}
                      >
                        {loading && (
                          <span className="spinner-border spinner-border-sm"></span>
                        )}
                        Sign In
                      </button>
                    </div>

                    {message && (
                      <div className="mb-3">
                        <div className={'alert alert-danger'} role="alert">
                          {message}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <Link to="/signup">Do not have an account? Sign up!</Link>
                    </div>
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

export default Signin;
