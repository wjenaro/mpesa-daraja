const express=require('express');
const axios=require('axios');
const app=express();
require('dotenv').config()

const PORT=3000;

// I need to provide my credentials to access the API
const consumerKey=process.env.ConsumerKey;
const consumerSecret=process.env.ConsumerSecret;


// send a post request to the API - so that I will get the access token
    
const getAccessToken=async()=>{

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    try {
        const response = await axios.post('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        }
    );
    return response.data;
        
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
        
    }


}
// Route to get access token
app.get('/daraja/token', async (req, res) => {
  try {
    const tokenResponse = await getAccessToken();
    res.json(tokenResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve access token' });
  }
});




      

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
} 
);
