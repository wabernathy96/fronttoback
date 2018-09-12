import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { deleteEducation } from "../../actions/profileActions";

class Education extends Component {
  onClickDelete(id) {
    this.props.deleteEducation(id);
  }

  render() {
    const education = this.props.education.map(
      edu => (
        <tr key={edu._id}>
          <td>{edu.school}</td>
          <td>{edu.degree}</td>
          <td>
            <Moment format="MM/DD/YYYY">{edu.from}</Moment> -{" "}
            {edu.to === null ? ("Present") : <Moment format="MM/DD/YYYY">{edu.to}</Moment>}
          </td>
          <td><button onClick={this.onClickDelete.bind(this, edu._id)} className="btn btn-danger">Delete Education</button></td>
        </tr>
      )
    )
    return (
      <div>
        <h4 className="mb-2">Education Credentials</h4>
        <table className="table">
          <thread>
            <tr>
              <th>School</th>
              <th>Degree</th>
              <th>Years</th>
              <th></th>
            </tr>
            <tbody>
              {education}
            </tbody>
          </thread>
        </table>
      </div>
    )
  }
}

Education.propTypes = {
  deleteEducation: PropTypes.func.isRequired
}

export default connect(null, { deleteEducation })(Education);