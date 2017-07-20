import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';

class ConfirmDelete extends React.Component {
    constructor(){
        super();
        this.state={
            password:'',
            error:""
        }
    }
    deleteData(){
    var this2 = this;
    var data = {email:this.props.auth.user.email,password:this.state.password}
	axios.post('/api/deleteData', data).then(function(res){
        if(res.data.data=="success"){
        this2.props.deleteData()
        }else{
        this2.setState({error:res.data.data})
        }
    })
    }
    onChange(e){
        this.setState({password:e.target.value,error:''})
    }
    render() {

        return (
            <div className="overlay" style={{
                display: 'flex',
                position: 'fixed',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="import-data-popup animated-slow bounceInUp" style={{width:300}}>

                    <div className="add-filter-title">Delete Data?
                        <i onClick={this.props.hideImportData} className="fa fa-close"/></div>
                    <div className="import-data-body" style={{textAlign:'center', margin:20,fontSize:'15pt'}}>
                        	<input 
                                placeholder="Enter Password"
                                onChange={this.onChange.bind(this)}
                                value={this.state.password}
                                type="password"
                                className="form-control"
		                	/>
                            <span>{this.state.error}</span>
                    </div>
                    <div className="add-filter-footer">

                        <div style={{
                            marginLeft: 'auto',
                            display: 'flex'
                        }}>

                            <div style={{
                                marginRight: 10,
                                marginLeft: 'auto'
                            }} className="basic-btn-blue" onClick={() => this.deleteData()}>Delete</div>
                            <div onClick={() => this.props.hideConfirmDeleteData()} className="add-filter-close-btn">close</div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}




function mapStateToProps(state) {
    return {auth: state.auth};
}
export default connect(mapStateToProps)(ConfirmDelete);
