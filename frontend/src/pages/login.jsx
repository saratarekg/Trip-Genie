import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

let role = null;
const Login = () => {
    const [email, setEmail] = useState(''); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
            });
    
            if (response.ok) {
                // role = response.body.role;
                const data = await response.json();
                role = data.role;

                // console.log(response.body.message);
                if (role === 'tour-guide'){
                    navigate('/tour-guide-home');
                }
                else{
                navigate('/');
                console.log('Login successful!');
                }
            } else {
                console.error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('An error occurred during login:', error);
        }
        
    };
   
    

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>

            <div className="form-group">
                    <label htmlFor="email">Email:</label> 
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export { Login as default, role };