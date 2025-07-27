import React from "react";
import "./index.scss";

function IdentityIcon(props){
    const {userType} = props;
    return (
        <span className={`top-identity-icon identity-icon-${userType}`}></span>
    )
}

export default IdentityIcon;