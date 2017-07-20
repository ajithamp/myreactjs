import React from 'react';
import ProspectItem from './prospect_item';
import {connect} from 'react-redux';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import ImportData from './import_data';
import MiniMap from '../../scripts/keymetrics_map';
import {Bar, Pie} from 'react-chartjs-2';
import Select from 'react-select';
import {Link} from 'react-router';
import Expirations from './expirations.js';
import ConfirmDelete from './confirm_delete';
import $ from 'jquery';
import ProspectiveLocations from './prospective_locations';
import '../../scripts/keymetrics_map.js';
var this3;
class KeyMetrics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search:'',
            value:'',
            clientId:'',
            showPage: "",
            prospectiveLocations: false,
            searches: [],
            importData: false,
            uploadedLocations: [],
            performingLocations: [],
            performingLocationSelector: '',
            keyMetrics: {
                totalSf: 0,
                totalSales: 0,
                totalProfit: 0,
                totalLocations: 0,
            },
                totalCities:[],
                totalStates:[],
                businessGroups:0,
                b_g:[],
                country_array:[],
                location:[],

            prospectiveMetrics: {
                totalSf: 0,
                totalSales: 0,
                totalProfit: 0,
                totalLocations: 0
            },
            dataInput:'',
            confirmDeleteDate:false
        }
        this3=this;
    }
    handleOptionSelectChange(value) {
      console.log(value)
        this.setState({ value });
      }
    updateSearch(event){
      this.setState({
        search: event.target.value.substr(0,20)
      });
    }
    showConfirmDeleteData(){
      this.setState({confirmDeleteDate:true})
    }
    hideConfirmDeleteData(){
      this.setState({confirmDeleteDate:false})
    }
    getClientSearches(clientId) {
        var this2 = this;
        axios.get('/api/getClientSearches/' + clientId).then(function(res) {
            this2.setState({searches: res.data.data});
        })
    }
    toggleProspectiveLocations() {
        if (this.state.prospectiveLocations) {
            this.setState({prospectiveLocations: false})
        } else {
            this.setState({prospectiveLocations: true})
        }

    }
    format(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    deleteImportData(){

      var this2 = this;
      axios.post('/api/DeleteImportData' + '/' + this.props.client.clientId).then(function(res){
        this2.setState({
          keyMetrics: {
              totalSf: 0,
              totalSales: 0,
              totalProfit: 0,
              totalLocations: 0
          },
              totalCities:[],
              totalStates:[],
              businessGroups:0,
              b_g:[],
              country_array:[],
              location:[],
          confirmDeleteDate:false,
          uploadedLocations: []
        })
      })
    }
    getPerformingLocations(filter, type, clientId) {
        var this2 = this;
        axios.get('/api/getUploadedFilteredLocations' +
            '/' + clientId + '/' + filter + '/' + type).then(function(res) {
            this2.setState({performingLocations: res.data.data})
        })
    }
    onPerformingLocationtionSelect(value) {
        this.setState({performingLocationSelector: value})
        this.getPerformingLocations(value.value.filter, value.value.type, this.props.client.clientId);
        MiniMap.getUploadedFilteredLocations(value.value.filter, value.value.type, this.props.client.clientId);
    }
    abbreviateNumber(value) {
        var newValue = value;
        var shortNum;
        if (value >= 1000) {
            var suffixes = ["", "K", "M", "B", "T"];
            var suffixNum = Math.floor(("" + value).length / 3);
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum != 0
                    ? (value / Math.pow(1000, suffixNum))
                    : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) {
                    break;
                }
            }
            if (shortValue % 1 != 0)
                shortNum = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    }
    showImportData() {
        if (this.props.client.clientId !== undefined) {
            this.setState({importData: true})
        } else {
            alert('please select a client');
        }

    }
    hideImportData() {
        this.setState({importData: false})
        this.getUploadedLocations(this.props.client.clientId);
    }
    refresh() {

        this.getClientSearches(this.props.client.clientId);
        this.getProspectiveTotals(this.props.client.clientId);
        this.getUploadedLocations(this.props.client.clientId);
        MiniMap.getUploadedLocations(this.props.client.clientId);
    }
    getProspectiveTotals(clientId) {
        var this2 = this;
        axios.get('/api/getClientSearches' +
            '/' + clientId).then(function(res) {

            var totalSf = 0;
            var totalSales = 0;
            var totalProfit = 0;
            var totalLocations = 0;
            res.data.data.forEach(function(item, i) {
                totalLocations = totalLocations + 1;
                if (item.sales != undefined && item.totalSales != "") {
                    totalSales = parseInt(totalSales) + parseInt(item.sales);
                }
                if (item.profit != undefined && item.totalProfit != "") {
                    totalProfit = parseInt(totalProfit) + parseInt(item.profit);
                }
                if (item.totalSf != undefined && item.totalSf != "") {
                    totalSf = parseInt(totalSf) + parseInt(item.totalSf);
                }

            })
            this2.setState({
                prospectiveMetrics: {
                    totalSf: totalSf,
                    totalSales: totalSales,
                    totalProfit: totalProfit,
                    totalLocations: totalLocations
                }
            })
        })
    }
    getUploadedLocations(clientId) {

        var this2 = this;
        axios.get('/api/getUploadedLocations/' + clientId).then(function(res) {
            //console.log(res.data.data);
            var totalSf = 0;
            var totalLocations = 0;
            var totalProfit = 0;
            var totalSales = 0;
            var totalGroups = 0;
            var businessGroups = 0;
            var cityArray = [];
            var stateArray = [];
            var b_g = [];
            var country_array = [];
            var location = [];
            res.data.data.forEach(function(item, i) {
            //  console.log(item);
                if (cityArray.includes(item.city)) {} else {
                    cityArray.push(item.city);
                }

                if (stateArray.includes(item.state)) {} else {
                    stateArray.push(item.state);
                }
                if(item.group!=''){
                    businessGroups = parseInt(businessGroups) + 1;
                if (b_g.includes(item.group)) {} else {
                    b_g.push(item.group);
                }   
                }
                if(item.country!=''){
                if (country_array.includes(item.country)) {} else {
                    country_array.push(item.country);
                }   
                }
                if(item["location name"]!=''){
                if (location.includes(item["location name"])) {} else {
                    location.push(item["location name"]);
                }   
                }

                totalLocations = parseInt(totalLocations) + 1;
                if(item['square feet']!=""){
                totalSf = parseInt(totalSf) + parseInt(item['square feet']);
                }
                totalSales = parseInt(totalSales) + parseInt(item.sales);

                totalProfit = parseInt(totalProfit) + parseInt(item.profit);

            })
            var sortedCityArray = cityArray.sort();
            var sortedStateArray = stateArray.sort();
            var totalSfFormatted = this2.abbreviateNumber(totalSf);
            var totalProfitFormatted = this2.abbreviateNumber(totalProfit);
            var totalSalesFormatted = this2.abbreviateNumber(totalSales);
            var totalLocationsFormatted = this2.format(totalLocations);
            this2.setState({
                uploadedLocations: res.data.data,
                keyMetrics: {
                    uploadedLocations: res.data.data,
                    totalSf: totalSf,
                    totalLocations: totalLocations,
                    totalSales: totalSales,
                    totalProfit: totalProfit,
                },
                    totalCities: sortedCityArray,
                    totalStates: sortedStateArray,
                    businessGroups:businessGroups,
                    b_g : b_g,
                    country_array:country_array,
                    location:location
            });
        })

    }
    componentWillReceiveProps(nextProps) {

        this.setState({clientId:nextProps.client.clientId})
        this.getClientSearches(nextProps.client.clientId);
        this.getUploadedLocations(nextProps.client.clientId);
        this.getProspectiveTotals(nextProps.client.clientId);
        MiniMap.getUploadedLocations(nextProps.client.clientId);
    }
    componentDidMount() {
        this.setState({clientId:this.props.client.clientId})
        this.getClientSearches(this.props.client.clientId);
        this.getProspectiveTotals(this.props.client.clientId);
        this.getUploadedLocations(this.props.client.clientId);
        MiniMap.getUploadedLocations(this.props.client.clientId);
    }
    topFilter(e){
        console.log(e.target.value,e.target.id)
        if(this.state.clientId != undefined){
            var this2 = this;
            axios.get('/api/getUploadedFilteredLocations/'+this2.state.clientId+'/'+e.target.id+'/'+e.target.value+"/").then(function(res) {
            console.log(res);
            var totalSf = 0;
            var totalLocations = 0;
            var totalProfit = 0;
            var totalSales = 0;
            var totalGroups = 0;
            res.data.data.forEach(function(item, i) {
            //  console.log(item);
                totalLocations = parseInt(totalLocations) + 1;
                if(item['square feet']!=""){
                totalSf = parseInt(totalSf) + parseInt(item['square feet']);
                }
                totalSales = parseInt(totalSales) + parseInt(item.sales);

                totalProfit = parseInt(totalProfit) + parseInt(item.profit);

            })
            var totalSfFormatted = this2.abbreviateNumber(totalSf);
            var totalProfitFormatted = this2.abbreviateNumber(totalProfit);
            var totalSalesFormatted = this2.abbreviateNumber(totalSales);
            var totalLocationsFormatted = this2.format(totalLocations);
            this2.setState({
                uploadedLocations: res.data.data,
                keyMetrics: {
                    uploadedLocations: res.data.data,
                    totalSf: totalSf,
                    totalLocations: totalLocations,
                    totalSales: totalSales,
                    totalProfit: totalProfit,
                }
            });
        })
        }
    }

    render() {
      var confirmDelete;
      if(this.state.confirmDeleteDate){
        confirmDelete = <ConfirmDelete deleteData={this.deleteImportData.bind(this)} hideConfirmDeleteData={this.hideConfirmDeleteData.bind(this)}/>;
      }
      var optionList = [
        {value: 'Options Held', label: 'Options Held'},
        {value: 'Encumbered By', label: 'Encumbered By'},
        {value: 'Right of First Offer', label: 'Right of First Offer'},
        {value: 'Right of First Refusal', label: 'Right of First Refusal'},
        {value: 'Relocation', label: 'Relocation'},
        {value: 'Renewal', label: 'Renewal'},
        {value: 'Termination', label: 'Termination'},
        {value: 'Other', label: 'Other'},
        {value: 'Right of First Purchase', label: 'Right of First Purchase'},
        {value: 'Early Possession', label: 'Early Possession'}

      ]
        var performingLocationsSelectData = [
            {
                value: {
                    filter: 'sales',
                    type: 'asc'
                },
                label: 'Bottom 10 Sales'
            }, {
                value: {
                    filter: 'profit',
                    type: 'asc'
                },
                label: 'Bottom 10 Profit'
            }, {
                value: {
                    filter: 'sales',
                    type: 'desc'
                },
                label: 'Top 10 Sales'
            }, {
                value: {
                    filter: 'profit',
                    type: 'desc'
                },
                label: 'Top 10 Profit'
            }
        ]


        var format = function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        var filteredLocations = this.state.uploadedLocations.filter(
          (data) => {
            return data['address'].toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
          }
          );
        var array = this.state.uploadedLocations;
        var sliceFrom = 0 - (parseInt(array.length) - 10);
        var topTen = array.slice(0, sliceFrom);

        var prospectiveLocations;
        var importData;
        if (this.state.prospectiveLocations) {
            prospectiveLocations = <ProspectiveLocations refresh={this.refresh.bind(this)} searches={this.state.searches}/>
        }
        if (this.state.importData) {
            importData = <ImportData hideImportData={this.hideImportData.bind(this)}/>
        }
        if (Object.keys(this.state.keyMetrics).length > 4) {
            var cityArray = this.state.totalCities.map(function(data, i) {
                return <option key={i}>{data}</option>
            })
            var stateArray = this.state.totalStates.map(function(data, i) {
                return <option key={i}>{data}</option>
            })
            var b_g_array = this.state.b_g.map(function(data, i) {
                return <option key={i}>{data}</option>
            })     
            var country_array = this.state.country_array.map(function(data, i) {
                return <option key={i}>{data}</option>
            })
             var location = this.state.location.map(function(data, i) {
                return <option key={i}>{data}</option>
            })
        }
        var headcount_sf = 0;
        if(this.state.keyMetrics.totalLocations!=0&&this.state.keyMetrics.totalSf!=0){
            headcount_sf=(this.state.keyMetrics.totalSf)/(this.state.keyMetrics.totalLocations*3);
        }
        var labor_sales = 0;
        if(this.state.keyMetrics.totalLocations!=0&&this.state.keyMetrics.totalSales!=0){
            labor_sales = (this.state.keyMetrics.totalSales)/(this.state.keyMetrics.totalLocations*3);
        }
        var headcount_sf1 = 0;
        if(this.state.prospectiveMetrics.totalLocations!=0&&this.state.prospectiveMetrics.totalSf!=0){
            headcount_sf1=(this.state.prospectiveMetrics.totalSf)/(this.state.prospectiveMetrics.totalLocations*3);
        }
        var labor_sales1 = 0;
        if(this.state.prospectiveMetrics.totalLocations!=0&&this.state.prospectiveMetrics.totalSales!=0){
            labor_sales1 = (this.state.prospectiveMetrics.totalSales)/(this.state.prospectiveMetrics.totalLocations*3);
        }
        var lease_assets = 0;
        if(this.state.keyMetrics.totalLocations!=0){
            lease_assets = this.state.keyMetrics.totalLocations-(this.state.keyMetrics.totalLocations-((this.state.keyMetrics.totalLocations/100)*88));
        }
        var owned_assets  = 0;
        if(this.state.keyMetrics.totalLocations!=0){
            owned_assets = this.state.keyMetrics.totalLocations-(this.state.keyMetrics.totalLocations-((this.state.keyMetrics.totalLocations/100)*4));
        }
        var sub_lease_assets = 0;
        if(this.state.keyMetrics.totalLocations!=0){
            sub_lease_assets = this.state.keyMetrics.totalLocations-(this.state.keyMetrics.totalLocations-((this.state.keyMetrics.totalLocations/100)*8));
        }
        var expirations = 0;
        if(this.state.keyMetrics.totalLocations!=0){
            expirations = this.state.keyMetrics.totalLocations-(this.state.keyMetrics.totalLocations-((this.state.keyMetrics.totalLocations/100)*2));
        }
        return (
            <main className="main">
                <ReactTooltip/> {importData}
                {confirmDelete}
                <div className="main-wrapper" style={{
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div className="container" style={{
                        background: '#fff',
                        boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                        padding: 0
                    }}>
                        <div className="key-metrics-top">
                            <div className="dropdown-selector-container">
                                <div className="dropdown-item-selector">
                                    <select id="group" onChange={this.topFilter.bind(this)}>
                                        <option>Business Groups</option>
                                        {b_g_array}
                                    </select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="country" onChange={this.topFilter.bind(this)}>
                                        <option>Country</option>
                                        {country_array}
                                    </select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="region" onChange={this.topFilter.bind(this)}>
                                        <option>Region</option>
                                    </select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="state" onChange={this.topFilter.bind(this)}>
                                        <option>State</option>{stateArray}</select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="city" onChange={this.topFilter.bind(this)}>
                                        <option>City</option>
                                        {cityArray}
                                    </select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="location" onChange={this.topFilter.bind(this)}>
                                        <option>Location</option>
                                        {location}
                                    </select>
                                </div>
                                <div className="dropdown-item-selector">
                                    <select id="time-frame" onChange={this.topFilter.bind(this)}>
                                        <option>Timeframe</option>
                                    </select>
                                </div>
                                <div onClick={this.showImportData.bind(this)} className="import-data-btn">Import Data</div>
                                <div onClick={this.showConfirmDeleteData.bind(this)} className="import-data-btn">Delete Data</div>
                            </div>
                            {/*<div class="client-selector-dropdown">
							<div class="client-selector-img"></div>
							<div class="client-selector-name">Client<br><span style="color:#3080e8;font-size: 12pt;">Muscle Maker Grill</span><i class="fa fa-caret-down"></i></div>
						</div>*/}
                        </div>
                        <div className="key-metrics-tiles">
                            <div className="key-metrics-title">
                                <h3>Key Metrics</h3><br/>See the potential impact of your prospective locations on your key financial metrics.</div>
                            <div className="key-metrics-tile-container">
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Locations<span data-tip="<div style='color:#fff'>percent of total</div>" data-html={true} style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip="Current">{this.state.keyMetrics.totalLocations}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.state.prospectiveMetrics.totalLocations}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="ti304le-number" data-tip={this.format(this.state.keyMetrics.totalLocations + this.state.prospectiveMetrics.totalLocations)}>{this.state.keyMetrics.totalLocations && this.state.keyMetrics.totalLocations + this.state.prospectiveMetrics.totalLocations}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>0</td></tr>
                        <tr><td>Variance</td><td>0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Sales<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={this.format(this.state.keyMetrics.totalSales)}>${this.abbreviateNumber(this.state.keyMetrics.totalSales)}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+${this.format(this.state.prospectiveMetrics.totalSales)}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={this.format((this.state.keyMetrics.totalSales) + this.state.prospectiveMetrics.totalSales)}>${this.state.keyMetrics.totalSales && this.abbreviateNumber((this.state.keyMetrics.totalSales ) + this.state.prospectiveMetrics.totalSales)}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>$0</td></tr>
                        <tr><td>Variance</td><td>-$0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Profit<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={this.format(this.state.keyMetrics.totalProfit)}>${this.abbreviateNumber(this.state.keyMetrics.totalProfit)}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+${this.format(this.state.prospectiveMetrics.totalProfit)}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={this.format(this.state.keyMetrics.totalProfit + this.state.prospectiveMetrics.totalProfit)}>${this.state.keyMetrics.totalProfit && this.abbreviateNumber(this.state.keyMetrics.totalProfit + this.state.prospectiveMetrics.totalProfit)}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>$0</td></tr>
                        <tr><td>Variance</td><td>0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Total SF<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={this.format(this.state.keyMetrics.totalSf)}>{this.state.keyMetrics.totalSf && this.abbreviateNumber(this.state.keyMetrics.totalSf)}
                                            <sup>SF</sup>
                                        </div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.state.prospectiveMetrics.totalSf}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={this.format(this.state.keyMetrics.totalSf + this.state.prospectiveMetrics.totalSf)}>{this.state.keyMetrics.totalSf && this.abbreviateNumber(this.state.keyMetrics.totalSf + this.state.prospectiveMetrics.totalSf)}
                                            <sup>SF</sup>
                                        </div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>0 SF</td></tr>
                        <tr><td>Variance</td><td>0 SF</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                            </div>
                            <div className="key-metrics-tile-container" style={{
                                paddingTop: 0
                            }}>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">HeadCount<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={this.state.keyMetrics.totalLocations*3}>{this.state.keyMetrics.totalLocations*3}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.state.prospectiveMetrics.totalLocations*3}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={this.state.keyMetrics.totalLocations*3}>{this.state.keyMetrics.totalLocations*3+this.state.prospectiveMetrics.totalLocations*3}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>2000</td></tr>
                        <tr><td>Variance</td><td>-57</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Expenses<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={this.state.keyMetrics.totalSales-this.state.keyMetrics.totalProfit}>${this.abbreviateNumber(this.state.keyMetrics.totalSales-this.state.keyMetrics.totalProfit)}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.abbreviateNumber(this.state.prospectiveMetrics.totalSales-this.state.prospectiveMetrics.totalProfit)}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={(this.state.keyMetrics.totalSales-this.state.keyMetrics.totalProfit)+(this.state.prospectiveMetrics.totalSales-this.state.prospectiveMetrics.totalProfit)}>${this.abbreviateNumber((this.state.keyMetrics.totalSales-this.state.keyMetrics.totalProfit)+(this.state.prospectiveMetrics.totalSales-this.state.prospectiveMetrics.totalProfit))}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>$0</td></tr>
                        <tr><td>Variance</td><td>0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Headcount / SF<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={parseInt(headcount_sf)}>{this.abbreviateNumber(parseInt(headcount_sf))}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.abbreviateNumber(parseInt(headcount_sf1))}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={parseInt(headcount_sf+headcount_sf1)}>{this.abbreviateNumber(parseInt(headcount_sf+headcount_sf1))}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>0</td></tr>
                        <tr><td>Variance</td><td>0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                                <div className="key-metrics-tile">
                                    <div className="tile-title">Labor / Sales<span data-tip="percent of total" style={{
                float: 'right'
            }}>100%</span>
                                    </div>
                                    <div className="tile-content">
                                        <div className="tile-number" data-tip={parseInt(labor_sales)}>${this.abbreviateNumber(parseInt(labor_sales))}</div>
                                        <div className="tile-difference">
                                            <div className="difference-number" style={{
                                                color: '#20A640'
                                            }}>+{this.abbreviateNumber(parseInt(labor_sales1))}</div><i className="fa fa-arrow-right"/></div>
                                        <div className="tile-number" data-tip={parseInt(labor_sales+labor_sales1)}>${this.abbreviateNumber(parseInt(labor_sales+labor_sales1))}</div>
                                    </div>
                                    {/* <div className="tile-details">
                    <table className="tile-details">
                      <tbody><tr><td>Budget</td><td>$0</td></tr>
                        <tr><td>Variance</td><td>0</td></tr>
                      </tbody></table>
                  </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="prospective-location-container">
                            <div onClick={this.toggleProspectiveLocations.bind(this)} className="prospective-location-btn">{this.state.prospectiveLocations
                                    ? "Hide Prospective Locations"
                                    : "Show Prospective Locations"}</div>
                            {prospectiveLocations}
                        </div>
                        <div className="metric-tile-sm-row">
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Owned Assets</div>
                                <div className="metric-tile-sm-value">{owned_assets}</div>
                            </div>
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Leased Assets</div>
                                <div className="metric-tile-sm-value">{lease_assets}</div>
                            </div>
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Sub-Leased Assets</div>
                                <div className="metric-tile-sm-value">{sub_lease_assets}</div>
                            </div>
                        </div>
                        <div className="metric-tile-sm-row">
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Square Feet</div>
                                <div className="metric-tile-sm-value">{this.format(this.state.keyMetrics.totalSf)}</div>
                            </div>
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Business Groups</div>
                                <div className="metric-tile-sm-value">{this.state.keyMetrics.businessGroups}</div>
                            </div>
                            <div className="metric-tile-sm">
                                <div className="metric-tile-sm-title">Expirations</div>
                                <div className="metric-tile-sm-value">{expirations}</div>
                            </div>
                        </div>
                        {/* <div className="map-tabs">
                            <div className="map-tab active">Lease Details</div>
                            <div className="map-tab">P&amp;L Details</div>
                            <div className="map-tab">Demographics</div>
                            <div className="map-tab">CRE Spend</div>
                        </div> */}
                        <div>
                            <Expirations/>
                            <div className="performing-locations-container">
                                <div className="performing-location-title" style={{color:'#3080e8'}}>Top/Bottom Performing Locations
                                    <div className="performing-location-dropdown" style={{
                                        width: 200
                                    }}>

                                        <Select className="my-selector" name="PerformingLocations" value={this.state.performingLocationSelector} options={performingLocationsSelectData} clearable={false} onChange={this.onPerformingLocationtionSelect.bind(this)}/>

                                    </div>
                                </div>
                                <div className="performing-locations">
                                  {this.state.performingLocations && this.state.performingLocations.map(function(data,i){
                                        if(this.state.performingLocationSelector.label == 'Bottom 10 Profit'){
                                            return <div key={i} className="location-item">
                                                <div className="location-number">#{i+1}</div>
                                                <div className="location-inner">
                                                    <div className="location-img" style={{
                                                        backgroundImage: 'url(https://maps.googleapis.com/maps/api/streetview?location=' + data.latitude + ',' + data.longitude + '&size=400x400&key=AIzaSyBXkG_joIB9yjAP94-L6S-GLTWnj7hYmzs)'
                                                    }}/>
                                                    <Link to={'/property/propertydetails/' +data.id}><div className="location-name">{data.address} {data.city} {data.state}</div></Link>
                                                    <div className="location-details">
                                                        <div className="location-detail-item">
                                                            <div className="location-detail-title">Sales</div>
                                                            <div className="location-detail-value"  style={{color:'#252525'}}>${this.format(data.sales)}</div>
                                                        </div>
                                                        <div className="location-detail-item">
                                                            <div className="location-detail-title">Profit</div>
                                                            <div className="location-detail-value">${this.format(data.profit)}</div>
                                                        </div>
                                                        <div className="location-detail-item">
                                                            <div className="location-detail-title">Square Feet</div>
                                                            <div className="location-detail-value" style={{color:'#252525'}}>{this.format(data["square feet"])}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                      }
                                      if(this.state.performingLocationSelector.label == 'Bottom 10 Sales'){
                                          return <div key={i} className="location-item">
                                              <div className="location-number">#{i+1}</div>
                                              <div className="location-inner">
                                                  <div className="location-img" style={{
                                                      backgroundImage: 'url(https://maps.googleapis.com/maps/api/streetview?location=' + data.latitude + ',' + data.longitude + '&size=400x400&key=AIzaSyBXkG_joIB9yjAP94-L6S-GLTWnj7hYmzs)'
                                                  }}/>
                                                  <Link to={'/property/propertydetails/' +data.id}><div className="location-name">{data.address} {data.city} {data.state}</div></Link>
                                                  <div className="location-details">
                                                      <div className="location-detail-item">
                                                          <div className="location-detail-title">Sales</div>
                                                          <div className="location-detail-value"  >${this.format(data.sales)}</div>
                                                      </div>
                                                      <div className="location-detail-item">
                                                          <div className="location-detail-title">Profit</div>
                                                          <div className="location-detail-value" style={{color:'#252525'}}>${this.format(data.profit)}</div>
                                                      </div>
                                                      <div className="location-detail-item">
                                                          <div className="location-detail-title">Square Feet</div>
                                                          <div className="location-detail-value" style={{color:'#252525'}}>{this.format(data["square feet"])}</div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                    }
                                    if(this.state.performingLocationSelector.label == 'Top 10 Sales'){
                                        return <div key={i} className="location-item">
                                            <div className="location-number green" >#{i+1}</div>
                                            <div className="location-inner">
                                                <div className="location-img" style={{
                                                    backgroundImage: 'url(https://maps.googleapis.com/maps/api/streetview?location=' + data.latitude + ',' + data.longitude + '&size=400x400&key=AIzaSyBXkG_joIB9yjAP94-L6S-GLTWnj7hYmzs)'
                                                }}/>
                                                <Link to={'/property/propertydetails/' +data.id}><div className="location-name">{data.address} {data.city} {data.state}</div></Link>
                                                <div className="location-details">
                                                    <div className="location-detail-item">
                                                        <div className="location-detail-title">Sales</div>
                                                        <div className="location-detail-value" style={{color:'#33dd33'}}  >${this.format(data.sales)}</div>
                                                    </div>
                                                    <div className="location-detail-item">
                                                        <div className="location-detail-title">Profit</div>
                                                        <div className="location-detail-value" style={{color:'#252525'}}>${this.format(data.profit)}</div>
                                                    </div>
                                                    <div className="location-detail-item">
                                                        <div className="location-detail-title">Square Feet</div>
                                                        <div className="location-detail-value" style={{color:'#252525'}}>{this.format(data["square feet"])}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                  }
                                  if(this.state.performingLocationSelector.label == 'Top 10 Profit'){
                                      return <div key={i} className="location-item">
                                          <div className="location-number green">#{i+1}</div>
                                          <div className="location-inner">
                                              <div className="location-img" style={{
                                                  backgroundImage: 'url(https://maps.googleapis.com/maps/api/streetview?location=' + data.latitude + ',' + data.longitude + '&size=400x400&key=AIzaSyBXkG_joIB9yjAP94-L6S-GLTWnj7hYmzs)'
                                              }}/>
                                              <Link to={'/property/propertydetails/' +data.id}><div className="location-name">{data.address} {data.city} {data.state}</div></Link>
                                              <div className="location-details">
                                                  <div className="location-detail-item">
                                                      <div className="location-detail-title">Sales</div>
                                                      <div className="location-detail-value" style={{color:'#252525'}}  >${this.format(data.sales)}</div>
                                                  </div>
                                                  <div className="location-detail-item">
                                                      <div className="location-detail-title">Profit</div>
                                                      <div className="location-detail-value" style={{color:'#33dd33'}}>${this.format(data.profit)}</div>
                                                  </div>
                                                  <div className="location-detail-item">
                                                      <div className="location-detail-title">Square Feet</div>
                                                      <div className="location-detail-value" style={{color:'#252525'}}>{this.format(data["square feet"])}</div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                }
                                  },this)}


                                </div>
                            </div>
                        </div>

                        <div className="map-option-dropdown" style={{width: '300px', float: 'right', textAlign: 'left',paddingBottom: '20px', zIndex: '10000'}}>
                            <div>
                                <span style={{
                                    paddingRight: 15,
                                    color: '#3080e8'
                                }}>Attributes</span>
                                <Select.Creatable multi simpleValue
                                            placeholder="Select Option"
                                            value={this.state.value}
                                            className="my-selector"
                                            name="Pois"
                                            onChange={this.handleOptionSelectChange.bind(this)}
                                            options={optionList}
                                            clearable={true}

                                        />
                            </div>
                        </div>
                        <div className="mini-map-container">
                            <div id="mini-map" style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative'
                            }}/>
                        </div>
                        <div className="map-property-list-container">
                          <input className="client-search" onChange={this.updateSearch.bind(this)} type="text" ref="uploadedLocationSearch" name="uploadedLocationSearch" placeholder="Search"/>
                            <ul className="prospective-locations-list">
                                {filteredLocations.map(function(data, i) {
                                    return <li key={i}>
                                        <div className="pros-loc-details">
                                            <div className="pros-loc-img" style={{
                                                backgroundImage: 'url(https://maps.googleapis.com/maps/api/streetview?location=' + data.latitude + ',' + data.longitude + '&size=400x400&key=AIzaSyBXkG_joIB9yjAP94-L6S-GLTWnj7hYmzs)'
                                            }}/>
                                            <Link to={'/property/propertydetails/' + data.id}><div className="pros-loc-name">
                                                <span className="pros-location-click" style={{
                                                    color: '#3080e8',
                                                    fontSize: '11pt'
                                                }}>{data.address}</span><br/>{data.city} {data.state} {data['zip code']}<br/></div></Link>
                                        </div>
                                        <div className="pros-loc-metric">Sales
                                            <br/>
                                            <span style={{
                                                color: '#3080e8',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>{'$' + format(parseInt(data.sales))}</span>
                                        </div>
                                        <div className="pros-loc-metric">Profit
                                            <br/>
                                            <span style={{
                                                color: '#3080e8',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>{'$' + format(parseInt(data.profit))}</span>
                                        </div>
                                        <div className="pros-loc-metric">Total SF
                                            <br/>
                                            <span style={{
                                                color: '#3080e8',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>{data['square feet']}</span>
                                        </div>
                                        <div className="pros-loc-metric">Headcount
                                            <br/>
                                            <span style={{
                                                color: '#3080e8',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>{this3.state.keyMetrics.totalLocations*3}</span>
                                        </div>
                                        <div className="pros-loc-metric">Expenses
                                            <br/>
                                            <span style={{
                                                color: '#3080e8',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>{data.sales-data.profit}</span>
                                        </div>
                                        {/*<div className="change-shadow-loc-btn">Change</div>
                          <div className="pros-shadow-loc">
                            <div className="pros-shadow-img" />
                            <div className="pros-shadow-name"><span style={{color: '#C94345', fontSize: '11pt'}}>3535 Malcom Ave (Shadow)</span><br />San Francisco CA, 94545<br />Strip Ctr.</div>
                          </div>*/}
                                    </li>
                                })}

                            </ul>
                        </div>
                    </div>
                </div>
            </main>

        );
    }
}

function mapStateToProps(state) {
    return {auth: state.auth, client: state.client};
}
export default connect(mapStateToProps)(KeyMetrics);
