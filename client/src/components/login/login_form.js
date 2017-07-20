import React from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import validateInput from '../validations/login_validation';
import TextFieldGroup from './text_field_group';
import { userLogin, getCustomer } from '../../actions/auth_actions';
import UserSignup from './user_signup';
import ForgotPassword from './forgot_password';

class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username : '',
			password : '',
			errors : {},
			isLoading : '',
			signupPopup: false,
			forgotPasswordPopup:false
		}

		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	isValid(){
		const { username, password } = this.state;
		if(username==''&&password==''){
			this.setState({
				errors : {form:'Enter Email and Password'}
			})
			return;
		}
		return true;
	}
	onChange(e){
		this.setState({
			[e.target.name] : e.target.value
		})
	}
	onSubmit(e){
		var this2 = this;
		if(this.isValid()==true){
			e.preventDefault();
			this.setState({errors: {}, isLoading: true});
			this.props.userLogin({
				username : String(this.state.username).toLowerCase(),
				password : this.state.password,
				errors : this.state.errors,
				isLoading : this.state.isLoading,
				signupPopup: this.state.signupPopup
			}).then(
				(res) => {
					this2.props.getCustomer(res.id);
					console.log(res.id);
					browserHistory.push('/map')
				},
				(err) => this.setState({errors: err.response.data.errors, isLoading: false})
				);
		}
	}
	setClientId(){
    if(this.props.auth.user.role === 'Basic'){
      this.props.setCurrentClient(this.props.auth.user.associated_clients[0].value, this.props.auth.user.associated_clients[0].label)
    }
 	 }
	openSignUp(){
		this.setState({
			signupPopup: true
		})
	}
	openForgotPassword(){
		this.setState({
			forgotPasswordPopup: true
		})
	}
	hideSignupPopup(){
		this.setState({
			signupPopup: false
		})
	}
	hideForgotPasswordPopup(){
		this.setState({
			forgotPasswordPopup: false
		})
	}
	render(){
		var signupPopup;
		var forgotPopup;
		if(this.state.signupPopup){
			signupPopup = <UserSignup hideSignupPopup={this.hideSignupPopup.bind(this)} />
		}
		if(this.state.forgotPasswordPopup){
			forgotPopup = <ForgotPassword hideForgotPasswordPopup={this.hideForgotPasswordPopup.bind(this)} />
		}else{
			forgotPopup = null;
		}

		const {username, password, errors} = this.state;
		return(

					<div>
					{signupPopup}
					{forgotPopup}
					   <div id="bg"></div>
						<div className="bg_login">

							<h2>LOGIN</h2>
		                {errors.form && <div className="alert alert-danger col-md-12 text-center" style={{padding:'10px', backgroundColor:'rgba(0,0,0,.5)',border:'0',fontSize:'12pt'}}>{errors.form}</div>}
						<label ></label>
						<input type="text" name="username" id="" value={username} placeholder="email" className="email" onChange={this.onChange} />
							
						<label ></label>
						<input type="password" name="password" id="" value={password}  placeholder="password" className="pass" onChange={this.onChange} />
							<span onClick={this.openForgotPassword.bind(this)}>Forgot Password?</span>
							<span className="pull-right" onClick={this.openSignUp.bind(this)}>Sign Up</span>
						<div className="text-center"><button onClick={this.onSubmit} className="login-btn">login to your account</button></div>
							
						</div>
		            </div>

			);
	}
}
function mapStateToProps(state){
  return{
    auth: state.auth,
    client: state.client
  }
}
export default connect((state) => {return {} }, { userLogin, getCustomer })(LoginForm);
