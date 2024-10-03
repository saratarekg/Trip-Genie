import React, { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';

let role = null;

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // This holds either email or username
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isValid, setIsValid] = useState(false); // Keeps track of whether the input is valid
    const navigate = useNavigate();

    // Helper function to check if the input is a valid email
    const isValidEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };

    // Validate identifier (either email or username)
    const validateIdentifier = (input) => {
        if (isValidEmail(input) || input.length > 2) {
            setErrorMessage(''); // Clear any error message
            setIsValid(true);
        } else {
            setErrorMessage('Please enter a valid email or username (min 3 characters).');
            setIsValid(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Only proceed if input is valid
        if (!isValid) {
            setErrorMessage('Please fix the errors before submitting.');
            return;
        }

        // Create the request body (determine if it's an email or username)
        const requestBody = {
            username: identifier, 
            password
        };

        try {
            const response = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody), // Send only the non-empty fields
            });
    
            if (response.ok) {
                const data = await response.json();
                role = data.role;

                if (role === 'tour-guide') {
                    navigate('/tour-guide-home');
                } else {
                    navigate('/');
                }
                console.log('Login successful!');
            } else {
                setErrorMessage('Login failed. Please check your credentials.');
            }
        } catch (error) {
            setErrorMessage('An error occurred during login. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Login to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                Email/Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text" // Text input to allow both email and username
                                    autoComplete="identifier"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        validateIdentifier(e.target.value); // Validate as the user types
                                    }}
                                />
                            </div>

                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {errorMessage && (
                                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                            )}

                        <div className="flex flex-col items-center justify-between">
                            <button
                                type="submit"
                                className={`w-full mb-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isValid} // Disable button if input is invalid
                            >
                                Log in
                            </button>

                            <Link
                                to="/sign-up"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Don't have an account? Sign up now!
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export { Login as default, role };