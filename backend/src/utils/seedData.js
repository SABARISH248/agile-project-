const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

const seedData = async () => {
  try {
    logger.info('Purging existing database collections for fresh seed...');
    await Promise.all([
      User.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Trip.deleteMany({}),
      Expense.deleteMany({}),
      Invoice.deleteMany({}),
      Maintenance.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    logger.info('Creating default authentication user profiles...');
    // Create Users (passwords hashed via pre-save hook)
    const adminUser = await User.create({
      name: 'Alexander Cross',
      email: 'admin@tracely.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    });

    const managerUser = await User.create({
      name: 'Samantha Ray',
      email: 'manager@tracely.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1 (555) 839-4421',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    });

    const driver1User = await User.create({
      name: 'Marcus Vance',
      email: 'driver@tracely.com',
      password: 'driver123',
      role: 'driver',
      phone: '+1 (555) 723-9912',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    });

    const driver2User = await User.create({
      name: 'David Miller',
      email: 'driver2@tracely.com',
      password: 'driver123',
      role: 'driver',
      phone: '+1 (555) 438-1188',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    });

    logger.info('Provisioning commercial logistics fleet...');
    // Create Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        registrationNumber: 'TRC-FL-8801',
        model: 'FH16 750 Globetrotter',
        make: 'Volvo Trucks',
        year: 2024,
        vehicleType: 'Container Lorry',
        capacityTons: 32.0,
        fuelType: 'Diesel',
        status: 'assigned',
        insurancePolicyNo: 'POL-VL-2024-998',
        insuranceExpiry: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
        permitExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        mileageKm: 42350,
        currentFuelLevel: 85,
        lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        registrationNumber: 'TRC-FL-9204',
        model: 'Prima 4028.S Heavy Haul',
        make: 'Tata Motors',
        year: 2023,
        vehicleType: 'Flatbed',
        capacityTons: 25.0,
        fuelType: 'Diesel',
        status: 'available',
        insurancePolicyNo: 'POL-TT-2023-412',
        insuranceExpiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        permitExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        mileageKm: 89120,
        currentFuelLevel: 65,
        lastServiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        registrationNumber: 'TRC-FL-4109',
        model: '2823C High-Torque Multi-Axle',
        make: 'BharatBenz',
        year: 2024,
        vehicleType: 'Box Truck',
        capacityTons: 18.0,
        fuelType: 'Diesel',
        status: 'assigned',
        insurancePolicyNo: 'POL-BB-2024-118',
        insuranceExpiry: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
        permitExpiry: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 220 * 24 * 60 * 60 * 1000),
        mileageKm: 28400,
        currentFuelLevel: 92,
        lastServiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        registrationNumber: 'TRC-FL-6512',
        model: 'R500 V8 Arctic Cold Chain',
        make: 'Scania',
        year: 2024,
        vehicleType: 'Refrigerated',
        capacityTons: 22.0,
        fuelType: 'Diesel',
        status: 'available',
        insurancePolicyNo: 'POL-SC-2024-303',
        insuranceExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        permitExpiry: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000),
        mileageKm: 51200,
        currentFuelLevel: 78,
        lastServiceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        registrationNumber: 'TRC-FL-1088',
        model: 'NPR 75 Eco-Clean Cargo',
        make: 'Isuzu Commercial',
        year: 2022,
        vehicleType: 'Box Truck',
        capacityTons: 8.5,
        fuelType: 'CNG',
        status: 'maintenance',
        insurancePolicyNo: 'POL-IS-2022-771',
        insuranceExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        permitExpiry: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        fitnessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        mileageKm: 114300,
        currentFuelLevel: 40,
        lastServiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    logger.info('Registering drivers and assigning vehicles...');
    // Create Drivers
    const driver1 = await Driver.create({
      user: driver1User._id,
      licenseNumber: 'DL-CA-992014-X',
      licenseExpiry: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000),
      experienceYears: 8,
      assignedVehicle: vehicles[0]._id,
      status: 'on_trip',
      rating: 4.9,
      completedTrips: 142,
      emergencyContact: {
        name: 'Sarah Vance',
        phone: '+1 (555) 723-9915',
        relation: 'Spouse',
      },
      bloodGroup: 'O+',
      address: '422 Industrial Way, Chicago, IL',
    });

    const driver2 = await Driver.create({
      user: driver2User._id,
      licenseNumber: 'DL-TX-440192-B',
      licenseExpiry: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000),
      experienceYears: 6,
      assignedVehicle: vehicles[2]._id,
      status: 'on_trip',
      rating: 4.8,
      completedTrips: 98,
      emergencyContact: {
        name: 'Elena Miller',
        phone: '+1 (555) 438-1190',
        relation: 'Sister',
      },
      bloodGroup: 'A+',
      address: '810 Lone Star Blvd, Dallas, TX',
    });

    logger.info('Creating commercial shipment bookings...');
    // Create Bookings
    const booking1 = await Booking.create({
      bookingNumber: 'TRC-BK-2026-001',
      customer: {
        name: 'Apex Industrial Steels Corp',
        companyName: 'Apex Steels Ltd',
        email: 'dispatch@apexsteel.com',
        phone: '+1 (800) 441-2900',
      },
      pickupLocation: {
        address: 'Harbor Gate Terminal 4, Industrial Port',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        coordinates: { lat: 18.9438, lng: 72.8387 },
      },
      dropLocation: {
        address: 'National Highway Heavy Logistics Yard 12',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110001',
        coordinates: { lat: 28.6139, lng: 77.209 },
      },
      cargoType: 'Machinery & Steel',
      weightTons: 24.5,
      distanceKm: 1420,
      preferredVehicleType: 'Container Lorry',
      pickupDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      basePrice: 5200.0,
      taxRate: 18,
      taxAmount: 936.0,
      totalAmount: 6136.0,
      status: 'in_transit',
      createdBy: managerUser._id,
    });

    const booking2 = await Booking.create({
      bookingNumber: 'TRC-BK-2026-002',
      customer: {
        name: 'FreshCold Biologics & Pharma',
        companyName: 'FreshCold Global',
        email: 'supply@freshcold.com',
        phone: '+1 (800) 993-1822',
      },
      pickupLocation: {
        address: 'Biotech Corridor Warehouse 9',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560100',
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      dropLocation: {
        address: 'Hitech City Distribution Depot 3',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500081',
        coordinates: { lat: 17.385, lng: 78.4867 },
      },
      cargoType: 'Perishable / Frozen',
      weightTons: 16.0,
      distanceKm: 570,
      preferredVehicleType: 'Box Truck',
      pickupDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 18 * 60 * 60 * 1000),
      basePrice: 2450.0,
      taxRate: 18,
      taxAmount: 441.0,
      totalAmount: 2891.0,
      status: 'in_transit',
      createdBy: managerUser._id,
    });

    const booking3 = await Booking.create({
      bookingNumber: 'TRC-BK-2026-003',
      customer: {
        name: 'Prime Motor Parts & Assembly',
        companyName: 'Prime Motors Inc',
        email: 'freight@primemotors.com',
        phone: '+1 (800) 220-4100',
      },
      pickupLocation: {
        address: 'Automotive Hub Sector 5',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001',
        coordinates: { lat: 13.0827, lng: 80.2707 },
      },
      dropLocation: {
        address: 'Auto Cluster Plant 2',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        coordinates: { lat: 18.5204, lng: 73.8567 },
      },
      cargoType: 'Automotive',
      weightTons: 18.0,
      distanceKm: 1180,
      preferredVehicleType: 'Flatbed',
      pickupDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      basePrice: 4100.0,
      taxRate: 18,
      taxAmount: 738.0,
      totalAmount: 4838.0,
      status: 'completed',
      createdBy: managerUser._id,
    });

    const booking4 = await Booking.create({
      bookingNumber: 'TRC-BK-2026-004',
      customer: {
        name: 'Horizon Consumer Goods Ltd',
        companyName: 'Horizon FMCG',
        email: 'orders@horizonfmcg.com',
        phone: '+1 (800) 777-3311',
      },
      pickupLocation: {
        address: 'Central Food Distribution Center',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        coordinates: { lat: 23.0225, lng: 72.5714 },
      },
      dropLocation: {
        address: 'Industrial Area Phase 4',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        coordinates: { lat: 26.9124, lng: 75.7873 },
      },
      cargoType: 'General Goods',
      weightTons: 12.0,
      distanceKm: 675,
      preferredVehicleType: 'Container Lorry',
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
      basePrice: 2150.0,
      taxRate: 18,
      taxAmount: 387.0,
      totalAmount: 2537.0,
      status: 'pending',
      createdBy: managerUser._id,
    });

    logger.info('Generating active and historical logistics trips...');
    // Create Trips
    const trip1 = await Trip.create({
      tripNumber: 'TRC-TRP-2026-001',
      booking: booking1._id,
      vehicle: vehicles[0]._id,
      driver: driver1._id,
      manager: managerUser._id,
      status: 'in_transit',
      lifecycle: {
        assignedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        inTransitAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      currentLocation: {
        name: 'Highway Toll Plaza NH-48, Rajasthan Border',
        lat: 24.5854,
        lng: 73.7125,
        updatedAt: new Date(),
      },
      startOdometer: 41800,
      timeline: [
        {
          status: 'assigned',
          timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
          location: 'Mumbai Dispatch Office',
          note: 'Trip assigned to Marcus Vance with Volvo FH16',
          updatedBy: managerUser._id,
        },
        {
          status: 'started',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          location: 'Harbor Gate Terminal 4, Mumbai',
          note: 'Cargo inspection complete and loaded onto trailer',
          updatedBy: driver1User._id,
        },
        {
          status: 'in_transit',
          timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
          location: 'Vapi Gujarat Highway Interchange',
          note: 'Passed checkpoint 1. Engine metrics nominal.',
          updatedBy: driver1User._id,
        },
      ],
      totalExpenses: 480.0,
    });

    const trip2 = await Trip.create({
      tripNumber: 'TRC-TRP-2026-002',
      booking: booking2._id,
      vehicle: vehicles[2]._id,
      driver: driver2._id,
      manager: managerUser._id,
      status: 'in_transit',
      lifecycle: {
        assignedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        inTransitAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      currentLocation: {
        name: 'Kurnool Bypass Highway Corridor',
        lat: 15.8281,
        lng: 78.0373,
        updatedAt: new Date(),
      },
      startOdometer: 28100,
      timeline: [
        {
          status: 'assigned',
          timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
          location: 'Bangalore Logistics Hub',
          note: 'Trip assigned to David Miller with BharatBenz 2823C',
          updatedBy: managerUser._id,
        },
        {
          status: 'started',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          location: 'Biotech Corridor Warehouse 9',
          note: 'Refrigerated container pre-chilled to -4°C. Seals verified.',
          updatedBy: driver2User._id,
        },
        {
          status: 'in_transit',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
          location: 'Anantapur Expressway',
          note: 'Cruising at 68 km/h. Cargo temperature steady.',
          updatedBy: driver2User._id,
        },
      ],
      totalExpenses: 210.0,
    });

    const trip3 = await Trip.create({
      tripNumber: 'TRC-TRP-2026-003',
      booking: booking3._id,
      vehicle: vehicles[1]._id,
      driver: driver1._id,
      manager: managerUser._id,
      status: 'delivered',
      lifecycle: {
        assignedAt: new Date(Date.now() - 80 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        inTransitAt: new Date(Date.now() - 65 * 60 * 60 * 1000),
        reachedDestinationAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      currentLocation: {
        name: 'Auto Cluster Plant 2, Pune',
        lat: 18.5204,
        lng: 73.8567,
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      startOdometer: 87940,
      endOdometer: 89120,
      proofOfDelivery: {
        recipientName: 'Vikram Joshi (Plant Receiving Manager)',
        recipientPhone: '+1 (800) 220-4109',
        notes: 'Delivered in mint condition with verified seals. Dock 4 unloaded.',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      totalExpenses: 650.0,
    });

    logger.info('Logging trip expenses and manager approvals...');
    // Create Expenses
    await Expense.insertMany([
      {
        trip: trip1._id,
        driver: driver1._id,
        category: 'fuel',
        amount: 320.0,
        description: 'Diesel refuel at Shell Highway Station (180 Liters @ $1.78/L)',
        fuelDetails: { liters: 180, pricePerLiter: 1.78, odometerKm: 42100 },
        status: 'approved',
        approvedBy: managerUser._id,
        expenseDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        trip: trip1._id,
        driver: driver1._id,
        category: 'toll',
        amount: 110.0,
        description: 'Expressway Electronic Toll collection - FASTag gateway',
        status: 'approved',
        approvedBy: managerUser._id,
        expenseDate: new Date(Date.now() - 16 * 60 * 60 * 1000),
      },
      {
        trip: trip1._id,
        driver: driver1._id,
        category: 'driver_allowance',
        amount: 50.0,
        description: 'Night shift driver meals and rest stop allowance',
        status: 'pending',
        expenseDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        trip: trip2._id,
        driver: driver2._id,
        category: 'fuel',
        amount: 160.0,
        description: 'Diesel top-up before high-range elevation',
        fuelDetails: { liters: 90, pricePerLiter: 1.78, odometerKm: 28350 },
        status: 'pending',
        expenseDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        trip: trip2._id,
        driver: driver2._id,
        category: 'toll',
        amount: 50.0,
        description: 'State highway toll plaza transit',
        status: 'approved',
        approvedBy: managerUser._id,
        expenseDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ]);

    logger.info('Generating enterprise commercial invoices...');
    // Create Invoices
    await Invoice.insertMany([
      {
        invoiceNumber: 'TRC-INV-2026-001',
        booking: booking3._id,
        trip: trip3._id,
        customer: {
          name: booking3.customer.name,
          companyName: booking3.customer.companyName,
          email: booking3.customer.email,
          phone: booking3.customer.phone,
          address: 'Auto Cluster Plant 2, Pune, Maharashtra 411001',
          gstOrTaxId: '27AABCP8821M1ZT',
        },
        lineItems: [
          {
            description: 'Long-haul Freight Transport: Chennai to Pune (1180 km, 18.0 Tons)',
            quantity: 1,
            unitPrice: 4100.0,
            total: 4100.0,
          },
        ],
        subtotal: 4100.0,
        taxRate: 18,
        taxAmount: 738.0,
        totalAmount: 4838.0,
        paidAmount: 4838.0,
        balanceDue: 0,
        paymentStatus: 'paid',
        paymentMethod: 'Bank Transfer',
        paymentReference: 'WIRE-NEFT-991204882',
        paidAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'TRC-INV-2026-002',
        booking: booking1._id,
        trip: trip1._id,
        customer: {
          name: booking1.customer.name,
          companyName: booking1.customer.companyName,
          email: booking1.customer.email,
          phone: booking1.customer.phone,
          address: 'Industrial Port Sector 4, Mumbai, MH 400001',
          gstOrTaxId: '27AAACA1092Q1ZV',
        },
        lineItems: [
          {
            description: 'Heavy Cargo Freight: Mumbai to New Delhi (1420 km, 24.5 Tons Machinery)',
            quantity: 1,
            unitPrice: 5200.0,
            total: 5200.0,
          },
        ],
        subtotal: 5200.0,
        taxRate: 18,
        taxAmount: 936.0,
        totalAmount: 6136.0,
        paidAmount: 3000.0,
        balanceDue: 3136.0,
        paymentStatus: 'partial',
        paymentMethod: 'Bank Transfer',
        paymentReference: 'ADV-50PERCENT-7721',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'TRC-INV-2026-003',
        booking: booking2._id,
        trip: trip2._id,
        customer: {
          name: booking2.customer.name,
          companyName: booking2.customer.companyName,
          email: booking2.customer.email,
          phone: booking2.customer.phone,
          address: 'Biotech Corridor Warehouse 9, Bangalore, KA 560100',
          gstOrTaxId: '29AAACC4491L1ZO',
        },
        lineItems: [
          {
            description: 'Cold-Chain Refrigerated Freight: Bangalore to Hyderabad (570 km, 16 Tons)',
            quantity: 1,
            unitPrice: 2450.0,
            total: 2450.0,
          },
        ],
        subtotal: 2450.0,
        taxRate: 18,
        taxAmount: 441.0,
        totalAmount: 2891.0,
        paidAmount: 0,
        balanceDue: 2891.0,
        paymentStatus: 'pending',
        paymentMethod: 'Unpaid',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ]);

    logger.info('Adding vehicle maintenance logs...');
    // Create Maintenance Records
    await Maintenance.insertMany([
      {
        vehicle: vehicles[4]._id,
        serviceType: 'Engine Overhaul',
        description: 'Valve clearance adjustment, timing chain replacement, and high-pressure fuel pump service.',
        cost: 1450.0,
        odometerAtService: 114300,
        serviceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextServiceDueKm: 135000,
        nextServiceDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        workshopName: 'Tracely Central Maintenance Depot',
        status: 'in_progress',
        performedBy: 'Master Tech Carl Benson',
      },
      {
        vehicle: vehicles[0]._id,
        serviceType: 'Oil Change',
        description: 'Synthetic engine oil change, dual fuel filter replacement, and chassis greasing.',
        cost: 420.0,
        odometerAtService: 40000,
        serviceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextServiceDueKm: 55000,
        nextServiceDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        workshopName: 'Volvo Authorized Fleet Care',
        status: 'completed',
        performedBy: 'Lead Tech Ronald Kim',
      },
      {
        vehicle: vehicles[1]._id,
        serviceType: 'Brake Inspection',
        description: 'Brake drum pad replacement across rear dual axles and air brake pressure leak test.',
        cost: 680.0,
        odometerAtService: 85000,
        serviceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextServiceDueKm: 100000,
        nextServiceDueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        workshopName: 'Highway Commercial Brake Specialists',
        status: 'completed',
        performedBy: 'Tech Anthony Rossi',
      },
    ]);

    logger.info('Broadcasting system and operational alerts...');
    // Create Notifications
    await Notification.insertMany([
      {
        role: 'all',
        title: 'Fleet System Operational',
        message: 'Tracely TMS v1.0 running with real-time GPS synchronization and automated cost calculation.',
        type: 'system',
        link: '/dashboard',
        isRead: false,
      },
      {
        role: 'manager',
        title: 'New Shipment Booking Received',
        message: 'Horizon FMCG booked shipment TRC-BK-2026-004 (12 Tons) pending truck & driver assignment.',
        type: 'booking',
        link: '/bookings',
        isRead: false,
      },
      {
        recipient: driver1User._id,
        role: 'driver',
        title: 'Trip Dispatched: Mumbai to New Delhi',
        message: 'Trip TRC-TRP-2026-001 has been dispatched. Please verify odometer and follow route NH-48.',
        type: 'trip',
        link: '/driver-dashboard',
        isRead: true,
      },
      {
        role: 'manager',
        title: 'Pending Fuel Expense Approval',
        message: 'Driver Marcus Vance submitted a fuel expense of $50.00 awaiting your approval.',
        type: 'expense',
        link: '/expenses',
        isRead: false,
      },
    ]);

    logger.success('Database successfully seeded with comprehensive logistics enterprise data!');
  } catch (error) {
    logger.error('Error during database seed:', error);
    throw error;
  }
};

const autoSeedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    logger.info('No existing users found. Triggering automated seed for instant out-of-the-box readiness...');
    await seedData();
  } else {
    logger.info(`Database already contains ${userCount} users. Auto-seed bypassed.`);
  }
};

// Standalone execution if run via CLI: `node seedData.js`
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  const { connectDB } = require('../config/db');

  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedData, autoSeedIfEmpty };
