/* eslint-disable */
import React from 'react';
import ReactSlider from 'react-slider';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class DemoEthnicity extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			min_value: 0,
			max_value : 12,
		
			ethnicitySelector : ""
		}
	}
	onGenderChange(val){
		this.setState({genderSelector : val})
	}
	onEthnicityChange(val){
		this.setState({ethnicitySelector : val})
	}
	handleChange = () => {
	var value = this.refs.child.getValue();

    this.setState({
      min_value: value[0],
      max_value : value[1]
    })
}
	getValues(){
		var min = this.state.min_value;
		var max = this.state.max_value;
		var array = [min,max];

		return array;
	}
	addFilter(){
		var title = "Ethnicity";
		var gender = this.state.genderSelector;
		var ethnicity = this.state.ethnicitySelector;
		var filter = {"title" : title, "value" : ethnicity.value}
		this.props.addFilter(filter);
			if(this.props.hideFilter==undefined){
			this.props.hideAddFilters();
		}else{
			this.props.hideFilter();
		}
	
	}
	hideFilter(){
		if(this.props.hideFilter==undefined){
			this.props.hideAddFilters();
		}else{
			this.props.hideFilter();
		}
	}
	render() {

		
        var ethnicityData = [
            { value: "white", label: 'White' },
            { value: "black", label: 'Black' },
            { value: "hispanic", label: 'Hispanic' },
            { value: "asian", label: 'Asian' },
            
        ];

		
		
		
		

		return(
				<div>
			     		<div>
					        <div className="add-filter-instructions">Select Values</div>
					        
					         <div className="selector-main-container" style={{width:'100%'}}>
						         <div className="selector-label"><div className="my-select-label">Ethnicity Separation</div>
						         		<Select
					                      className="my-selector"
					                      name="Gender"
					                      value={this.state.ethnicitySelector}
					                      options={ethnicityData}
					                      clearable={false}
					                      onChange={this.onEthnicityChange.bind(this)}
					                  />
						         </div>
						         
					         </div>
					        <div className="add-filter-footer"><div style={{marginLeft:'auto'}}><div onClick={this.addFilter.bind(this)} className="add-filter-add-btn">Add</div><div onClick={this.hideFilter.bind(this)} className="add-filter-close-btn">close</div></div></div>
					      </div>


				</div>
			);
	}
}
export default DemoEthnicity;