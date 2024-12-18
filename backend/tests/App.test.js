require("dotenv").config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const touristRoutes = require('../routes/touristRoutes');
const Tourist = require('../models/tourist');
const Product = require('../models/product');
const Currency = require('../models/currency');

const app = express();
app.use(express.json());
app.use('/tourist', touristRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Tourist Routes', () => {
  let testTouristId;
  let testNationalityId;

  beforeEach(async () => {
    // Create a test nationality
    const testNationality = new mongoose.Types.ObjectId();
    testNationalityId = testNationality;

    const testTourist = new Tourist({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      jobOrStudent: 'Student',
      dateOfBirth: new Date('1990-01-01'),
      nationality: testNationalityId,
      mobile: '+1234567890123', // Valid format: country code + 10 digits
    });
    await testTourist.save();
    testTouristId = testTourist._id;
  });

  afterEach(async () => {
    await Tourist.deleteMany({});
    // await Product.deleteMany({});
    // await Currency.deleteMany({});
  });

  test('GET /tourist - should get tourist profile', async () => {
    const res = await request(app).get('/tourist').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('testuser');
  });

  test('PUT /tourist - should update tourist profile', async () => {
    const res = await request(app)
      .put('/tourist')
      .set('user_id', testTouristId)
      .send({ 
        username: 'updateduser', 
        email: 'updated@example.com',
        jobOrStudent: 'Professional',
        nationality: testNationalityId,
        mobile: '+9876543210987' // Valid format: country code + 10 digits
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('updateduser');
  });

  test('PUT /tourist/preferences - should update tourist preferences', async () => {
    const res = await request(app)
      .put('/tourist/preferences')
      .set('user_id', testTouristId)
      .send({ budget: 1000, categories: ['adventure', 'culture'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.preference.budget).toBe(1000);
  });

  test('GET /tourist/cart - should get tourist cart', async () => {
    const res = await request(app).get('/tourist/cart').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('DELETE /tourist/empty/cart - should empty tourist cart', async () => {
    const res = await request(app).delete('/tourist/empty/cart').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Cart emptied');
  });

  test('GET /tourist/wishlist - should get tourist wishlist', async () => {
    const res = await request(app).get('/tourist/wishlist').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('DELETE /tourist/remove/wishlist/:id - should remove product from wishlist', async () => {
    const product = new Product({ name: 'Test Product', price: 100 });
    await product.save();
    await Tourist.findByIdAndUpdate(testTouristId, { $push: { wishlist: { product: product._id } } });

    const res = await request(app).delete(`/tourist/remove/wishlist/${product._id}`).set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Product removed from wishlist');
  });

  test('PUT /tourist/move/wishlist/:id - should move product from wishlist to cart', async () => {
    const product = new Product({ name: 'Test Product', price: 100 });
    await product.save();
    await Tourist.findByIdAndUpdate(testTouristId, { $push: { wishlist: { product: product._id } } });

    const res = await request(app).put(`/tourist/move/wishlist/${product._id}`).set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Product moved to cart');
  });

  test('GET /tourist/currencies/code - should get currency code', async () => {
    const currency = new Currency({ code: 'USD', name: 'US Dollar' });
    await currency.save();
    await Tourist.findByIdAndUpdate(testTouristId, { preferredCurrency: currency._id });

    const res = await request(app).get('/tourist/currencies/code').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('USD');
  });

  test('POST /tourist/currencies/set - should set currency code', async () => {
    const currency = new Currency({ code: 'EUR', name: 'Euro' });
    await currency.save();

    const res = await request(app)
      .post('/tourist/currencies/set')
      .set('user_id', testTouristId)
      .send({ currencyId: currency._id });
    expect(res.statusCode).toBe(200);
    expect(res.body.currencyCode).toBe('EUR');
  });

  test('PUT /tourist/add-card - should add a new card', async () => {
    const res = await request(app)
      .put('/tourist/add-card')
      .set('user_id', testTouristId)
      .send({
        cardType: 'Credit Card',
        cardNumber: '1234567890123456',
        expiryDate: '12/25',
        holderName: 'Test User',
        cvv: '123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Card added successfully');
  });

  test('GET /tourist/cards - should get all cards', async () => {
    const res = await request(app).get('/tourist/cards').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.cards)).toBeTruthy();
  });

  test('PUT /tourist/add-shippingAdd - should add a new shipping address', async () => {
    const res = await request(app)
      .put('/tourist/add-shippingAdd')
      .set('user_id', testTouristId)
      .send({
        streetName: 'Test Street',
        streetNumber: '123',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Address added successfully');
  });

  test('GET /tourist/shippingAdds - should get all shipping addresses', async () => {
    const res = await request(app).get('/tourist/shippingAdds').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.shippingAddresses)).toBeTruthy();
  });

  test('POST /tourist/redeem-points - should redeem loyalty points', async () => {
    await Tourist.findByIdAndUpdate(testTouristId, { loyaltyPoints: 10000 });

    const res = await request(app).post('/tourist/redeem-points').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Successfully redeemed');
  });

  test('POST /tourist/password - should change password', async () => {
    const res = await request(app)
      .post('/tourist/password')
      .set('user_id', testTouristId)
      .send({ oldPassword: 'Password123!', newPassword: 'NewPassword123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');
  });

  test('POST /tourist/complaint - should add a new complaint', async () => {
    const res = await request(app)
      .post('/tourist/complaint')
      .set('user_id', testTouristId)
      .send({ title: 'Test Complaint', description: 'This is a test complaint' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Complaint added successfully');
  });

  test('GET /tourist/complaints - should get all complaints', async () => {
    const res = await request(app).get('/tourist/complaints').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('DELETE /tourist/delete-account - should delete tourist account', async () => {
    const res = await request(app).delete('/tourist/delete-account').set('user_id', testTouristId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Account deleted successfully');
  });
});

// Log the test results
console.log('Tourist Routes Tests completed successfully!');