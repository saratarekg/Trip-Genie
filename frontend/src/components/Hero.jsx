import React from "react";
import {Link, useNavigate} from "react-router-dom";
import hero1 from "../assets/images/hero1.png";
import hero2 from "../assets/images/hero2.png";
import hero3 from "../assets/images/hero3.png";
import heroArrow from "../assets/images/heroArrow.svg";

import "../styles/Hero.css";
import { useSession } from "@/utils/logging/components/sessionContext.jsx";
const Navbar = () => {
    const { logInteraction } = useSession();


    return (
        <div className="heroContainer">
            <div className="imgW ">
                <img src={hero1} alt="hero1" className="heroImg1"  onClick={() => logInteraction("button_click", "Clicked Start")}/>
                <Link to={"/"}>

                    <p className="heroLinks">Activities</p>
                    <img src={heroArrow} alt="heroArrow" className="heroArrow" />
                </Link>


            </div>
            <div className="imgW">
                <img src={hero2} alt="hero2" className="heroImg2" />
                <Link to={"/"}>

                    <p className="heroLinks">Itineraries</p>
                    <img src={heroArrow} alt="heroArrow" className="heroArrow" />
                </Link>

            </div>

            <div className="imgW">
                <img src={hero3} alt="hero3" className="heroImg3" />
                <Link to={"/"}>

                    <p className="heroLinks">Products</p>
                    <img src={heroArrow} alt="heroArrow" className="heroArrow" />
                </Link>

            </div>
            <p className="heroTitle">Discover New Places and Create Unforgettable Memories</p>







        </div>
    );
};

export default Navbar;
