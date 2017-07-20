/* eslint-disable */
import React from 'react';
import $ from 'jquery';
import DemographicFilterItem from './demographic_filter_item';
import AddDemoFilterPopup from './add_demo_filter_popup';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ToggleSwitch from '@trendmicro/react-toggle-switch';
import Client from '../../../scripts/myScript.js';
import DemoCrime from './demo_crime';
import DemoEthnicity from './demo_ethnicity';
import DemoHouseholds from './demo_households';
import DemoEducation from './demo_education';
import DemoPopulation from './demo_population';
import DemoGender from './demo_gender';
import DemoHome from './demo_home';
import Overlay from './overlay';
import DemoHouseholdIncome from './demo_household_income';

import '@trendmicro/react-toggle-switch/dist/react-toggle-switch.css';

class DemographicPopout extends React.Component {
	constructor(props) {
    super(props);
      this.state = {
        filters : [],
        add_filter_open : false,
        checked : false,
        page:{},
        index:''
      }
      this.page;
    }
    componentWillMount(){
      if(this.props.demoValue.length!=0){
      this.setState({filters:this.props.demoValue});
      this.filterZips();
      }
    }
    showAddFilters(){
			$('.zip-code-popup').fadeOut();
      this.setState({
        add_filter_open : true
      })
      $(".right-side-bar").hide();
    }
    hideAddFilters(){
			$('.zip-code-popup').fadeIn();
      this.setState({
        add_filter_open : false
      })
    }
    toggleChange(){
       if(this.state.checked === false){
        this.filterZips();
      }
      this.setState({ checked: !this.state.checked });


    }
    addFilter(options){
      if(this.state.index!=''){
      var newArray = this.state.filters;
      newArray.splice(Number(this.state.index),1,options);
      var that = this;
      setTimeout(function(){
      that.setState({filters: newArray})
      that.filterZips();
      },100);
      this.props.demoValueFun(newArray)
      return;
      }
      var newArray = this.state.filters.slice();
      newArray.push(options);
      var that = this;
      setTimeout(function(){
      that.setState({filters: newArray})
      that.filterZips();
      },100);
      this.props.demoValueFun(newArray)
      
    }
    removeFilter(index){
      var newArray = this.state.filters.slice();
      newArray.splice(index, 1);
      var that = this;
      setTimeout(function(){
        that.setState({filters: newArray,page:{},index:''})
        that.filterZips();
      },100)

    }
    filterZips(){
      this.setState({
        checked : true
      })
      var that = this;
      // if(this.state.checked){

      // }else{
        Client.getZipsFromBounds(function(result){
          var filters = that.state.filters;

          Client.filterZips(result, filters, function(result){

            Client.drawFilteredZips(result.data);
          })
        });
      //}
    }
    editFilter(data,i){
      this.setState({page:data,index:i.toString()})
    }
    hideFilter(){
      this.page = '';
      this.setState({page:{},index:''})
    }

    clearDrawnZips(){
      Client.clearDrawnZips();
    }
		format(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
	render() {
  
   if(this.state.page.title  == undefined){
			this.page = '';
		}
    else
		if(this.state.page.title  == "IncomePerHousehold"){
			this.page = <DemoHouseholdIncome ref="DemoHouseholdIncome" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "PropertyCrime"){
			this.page = <DemoCrime ref="DemoCrime" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "Ethnicity"){
			this.page = <DemoEthnicity ref="DemoEthnicity" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "Gender"){
			this.page = <DemoGender ref="DemoGender" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "TotalHouseholds"){
			this.page = <DemoHouseholds ref="DemoHouseholds" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "EducationBachelorOrGreater"){
			this.page = <DemoEducation ref="DemoEducation" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>
			
		}else
		if(this.state.page.title  == "Population"){
			this.page = <DemoPopulation ref="DemoPopulation" addFilter={this.addFilter.bind(this)} key={2} hideFilter={this.hideFilter.bind(this)}/>	
		}
    if(this.state.checked == false){
      this.clearDrawnZips();
    }
    var filters;
    var addFilterPopup;
    var noFilter;
    if(this.state.add_filter_open){
      addFilterPopup =  <AddDemoFilterPopup addFilter={this.addFilter.bind(this)} hideAddFilters={this.hideAddFilters.bind(this)}/>

    }else{
      addFilterPopup = null;
    }

    if(this.state.filters.length == 0){
      noFilter = <div className="nodemos">No Demographic Filters</div>
    }else{
      noFilter = null;
      filters = this.state.filters.map(function(data, i){
                if(data.minVal == undefined){
                  return <div key={i} className="demo-filter animated fadeInUp" onClick={()=>this.editFilter(data,i)}>{data.title.replace(/([A-Z])/g, ' $1').trim()}&nbsp;&nbsp;{data.label}<i onClick={this.removeFilter.bind(this, i)} className="fa fa-times-rectangle"></i></div>
                }else{
                  return <div key={i} className="demo-filter animated fadeInUp" onClick={()=>this.editFilter(data,i)}>{data.title.replace(/([A-Z])/g, ' $1').trim()}&nbsp;&nbsp;{this.format(data.minVal)}&nbsp;&nbsp;-&nbsp;&nbsp;{this.format(data.maxVal)}<i onClick={this.removeFilter.bind(this, i)} className="fa fa-times-rectangle"></i></div>
                }

              },this)
    }
		return (
				<div className="left-nav-popup">
        <div className="left-nav-popup-title" style={{textAlign: 'left'}}>Demographics <div style={{float: 'right',paddingRight:20}}>
        <ToggleSwitch
            checked={this.state.checked}
            size="small"
            onChange={this.toggleChange.bind(this)}
        /><i className="fa fa-close close_menu" style={{paddingTop:3,color:"#252525"}} onClick={this.props.close_pop}></i></div>
</div>

        <div className="demo-filter-list">
          {noFilter}
          {filters}
          <ReactCSSTransitionGroup
                transitionName="fade"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}>
          {addFilterPopup}
          </ReactCSSTransitionGroup>
        </div>
        <div onClick={this.showAddFilters.bind(this)} className="add-more-filters"><i className="fa fa-sliders" /> Add Filter</div>
        <div style={{marginTop: 20}}>
           {this.page}
        </div>
      </div>

			);
	}
}
export default DemographicPopout;
