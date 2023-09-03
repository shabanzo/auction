import { ComponentType } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface WithRouterProps {
  location: any;
  navigate: any;
  params: any;
}

const withRouter = <P extends object>(
  Component: ComponentType<P & { router: WithRouterProps }>,
) => {
  function ComponentWithRouterProp(props: P) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
};

export default withRouter;
