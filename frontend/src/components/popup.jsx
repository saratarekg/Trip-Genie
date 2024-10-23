import React, { useEffect } from 'react';
import '@/styles/Popup.css'; // Create a CSS file for styling

import 'bootstrap/dist/css/bootstrap.min.css';


const Popup = ({ isOpen, onClose, type }) => {
    const isSuccess = type === 'success';
    
    return (
        <>
            {isOpen && (
                <div className="modal fade show" style={{ display: 'block' }} id={`${type}Popup`} tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                        <div className="modal-content">
                            <div className="modal-body text-center p-lg-4">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                    <circle
                                        className="path circle"
                                        fill="none"
                                        stroke={isSuccess ? "#198754" : "#db3646"}
                                        strokeWidth="6"
                                        strokeMiterlimit="10"
                                        cx="65.1"
                                        cy="65.1"
                                        r="62.1"
                                    />
                                    {isSuccess ? (
                                        <polyline
                                            className="path check"
                                            fill="none"
                                            stroke="#198754"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeMiterlimit="10"
                                            points="100.2,40.2 51.5,88.8 29.8,67.5"
                                        />
                                    ) : (
                                        <>
                                            <line
                                                className="path line"
                                                fill="none"
                                                stroke="#db3646"
                                                strokeLinecap="round"
                                                strokeMiterlimit="10"
                                                x1="34.4"
                                                y1="37.9"
                                                x2="95.8"
                                                y2="92.3"
                                            />
                                            <line
                                                className="path line"
                                                fill="none"
                                                stroke="#db3646"
                                                strokeLinecap="round"
                                                strokeMiterlimit="10"
                                                x1="95.8"
                                                y1="38"
                                                x2="34.4"
                                                y2="92.2"
                                            />
                                        </>
                                    )}
                                </svg>
                                <h4 className={isSuccess ? "text-success mt-3" : "text-danger mt-3"}>
                                    {isSuccess ? 'Oh Yeah!' : 'Invalid email!'}
                                </h4>
                                <p className="mt-3">
                                    {isSuccess ? 'You have successfully registered and logged in.' : 'This email is already registered, please login.'}
                                </p>
                                <button type="button" className={`btn btn-sm mt-3 btn-${isSuccess ? 'success' : 'danger'}`} onClick={onClose}>
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Popup;
