import React from 'react';
import {browserHistory} from 'react-router';
import logo from '../../../images/sitemap_logo.png';
import {connect} from 'react-redux';
import { userLogin } from '../../actions/auth_actions';
import LoginForm from './login_form';


class LoginHome extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username : '',
			password : '',
			errors : {},
			isLoading : ''
		}
	}
componentDidMount() {
		if(this.props.auth.isAuthenticated){
			browserHistory.push('/map')
		}else{

		}
	}

	render() {

		return(
			<LoginForm/>
			);
	}
}

function mapStateToProps(state){
  return {
    auth: state.auth
  };
}

export default connect(mapStateToProps, {userLogin})(LoginHome);
