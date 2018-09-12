import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { deleteExperience } from "../../actions/profileActions";

class Experience extends Component {
  onClickDelete(id) {
    this.props.deleteExperience(id);
  }

  render() {
    const experience = this.props.experience.map(
      exp => (
        <tr key={exp._id}>
          <td>{exp.company}</td>
          <td>{exp.title}</td>
          <td>
            <Moment format="MM/DD/YYYY">{exp.from}</Moment> -{" "}
            {exp.to === null ? ("Present") : <Moment format="MM/DD/YYYY">{exp.to}</Moment>}
          </td>
          <td><button onClick={this.onClickDelete.bind(this, exp._id)} className="btn btn-danger">Delete Experience</button></td>
        </tr>
      )
    )
    return (
      <div>
        <h4 className="mb-2">Experience Credentials</h4>
        <table className="table">
          <thread>
            <tr>
              <th>Company</th>
              <th>Title</th>
              <th>Years</th>
              <th></th>
            </tr>
            <tbody>
              {experience}
            </tbody>
          </thread>
        </table>
      </div>
    )
  }
}

Experience.propTypes = {
  deleteExperience: PropTypes.func.isRequired
}

export default connect(null, { deleteExperience })(Experience);