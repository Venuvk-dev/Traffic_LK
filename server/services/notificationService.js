// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Email transporter configuration
// const emailTransporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: process.env.EMAIL_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // SMS service configuration with proper Sri Lankan providers
// class SMSService {
//   static async sendSMS(phoneNumber, message) {
//     try {
//       // Check if SMS is enabled
//       if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
//         console.log(`SMS disabled. Would send to ${phoneNumber}: ${message}`);
//         return { success: true, messageId: `SMS_DISABLED_${Date.now()}`, disabled: true };
//       }

//       // Format phone number for Sri Lankan format
//       const formattedPhone = this.formatSriLankanPhone(phoneNumber);
      
//       // Use different SMS providers based on configuration
//       const provider = process.env.SMS_PROVIDER || 'mock';
      
//       switch (provider) {
//         case 'dialog':
//           return await this.sendDialogSMS(formattedPhone, message);
//         case 'mobitel':
//           return await this.sendMobitelSMS(formattedPhone, message);
//         case 'twilio':
//           return await this.sendTwilioSMS(formattedPhone, message);
//         default:
//           return await this.sendMockSMS(formattedPhone, message);
//       }
//     } catch (error) {
//       console.error('SMS sending failed:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Format phone number to Sri Lankan international format
//   static formatSriLankanPhone(phoneNumber) {
//     // Remove all non-digit characters
//     let cleaned = phoneNumber.replace(/\D/g, '');
    
//     // Handle different Sri Lankan phone number formats
//     if (cleaned.startsWith('94')) {
//       return `+${cleaned}`;
//     } else if (cleaned.startsWith('0')) {
//       return `+94${cleaned.substring(1)}`;
//     } else if (cleaned.length === 9) {
//       return `+94${cleaned}`;
//     }
    
//     return `+94${cleaned}`;
//   }

//   // Dialog SMS API (Sri Lankan provider)
//   static async sendDialogSMS(phoneNumber, message) {
//     try {
//       const apiUrl = process.env.DIALOG_SMS_URL || 'https://api.dialog.lk/sms/send';
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.DIALOG_API_KEY}`,
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({
//           to: phoneNumber,
//           message: message,
//           from: process.env.SMS_SENDER_ID || 'TrafficLK'
//         })
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log(`Dialog SMS sent to ${phoneNumber}: ${message}`);
//         return { success: true, messageId: result.messageId || `DIALOG_${Date.now()}` };
//       } else {
//         throw new Error(`Dialog SMS API error: ${response.status}`);
//       }
//     } catch (error) {
//       console.error('Dialog SMS error:', error);
//       // Fallback to mock SMS
//       return await this.sendMockSMS(phoneNumber, message);
//     }
//   }

//   // Mobitel SMS API (Sri Lankan provider)
//   static async sendMobitelSMS(phoneNumber, message) {
//     try {
//       const apiUrl = process.env.MOBITEL_SMS_URL || 'https://api.mobitel.lk/sms/send';
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.MOBITEL_API_KEY}`,
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({
//           to: phoneNumber,
//           text: message,
//           from: process.env.SMS_SENDER_ID || 'TrafficLK'
//         })
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log(`Mobitel SMS sent to ${phoneNumber}: ${message}`);
//         return { success: true, messageId: result.messageId || `MOBITEL_${Date.now()}` };
//       } else {
//         throw new Error(`Mobitel SMS API error: ${response.status}`);
//       }
//     } catch (error) {
//       console.error('Mobitel SMS error:', error);
//       // Fallback to mock SMS
//       return await this.sendMockSMS(phoneNumber, message);
//     }
//   }

//   // Twilio SMS API (International provider)
//   static async sendTwilioSMS(phoneNumber, message) {
//     try {
//       const accountSid = process.env.TWILIO_ACCOUNT_SID;
//       const authToken = process.env.TWILIO_AUTH_TOKEN;
//       const fromNumber = process.env.TWILIO_PHONE_NUMBER;

//       if (!accountSid || !authToken || !fromNumber) {
//         throw new Error('Twilio credentials not configured');
//       }

//       const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
//       const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Basic ${auth}`
//         },
//         body: new URLSearchParams({
//           To: phoneNumber,
//           From: fromNumber,
//           Body: message
//         })
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log(`Twilio SMS sent to ${phoneNumber}: ${message}`);
//         return { success: true, messageId: result.sid };
//       } else {
//         const error = await response.json();
//         throw new Error(`Twilio SMS API error: ${error.message}`);
//       }
//     } catch (error) {
//       console.error('Twilio SMS error:', error);
//       // Fallback to mock SMS
//       return await this.sendMockSMS(phoneNumber, message);
//     }
//   }

//   // Mock SMS service for development/testing
//   static async sendMockSMS(phoneNumber, message) {
//     console.log(`📱 MOCK SMS to ${phoneNumber}: ${message}`);
    
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     // Simulate occasional failures for testing
//     if (Math.random() < 0.05) { // 5% failure rate
//       throw new Error('Mock SMS service temporary failure');
//     }
    
//     return { 
//       success: true, 
//       messageId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       mock: true
//     };
//   }
// }

// class NotificationService {
//   // Send points deduction notification
//   static async sendPointsDeductionNotification(user, fine, vehicle, pointsDeducted, newPoints, customReason = null) {
//     const pointsStatus = user.getPointsStatus();
//     const emailSubject = `Driving Points Deducted - ${pointsDeducted} Points`;
    
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Points Deduction</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Driving Points Deducted</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>Your driving points have been deducted due to a traffic violation.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
//             <h3 style="color: #dc2626; margin-top: 0;">Points Deduction Details</h3>
//             <p><strong>Points Deducted:</strong> ${pointsDeducted}</p>
//             <p><strong>Remaining Points:</strong> ${newPoints}/100</p>
//             <p><strong>Reason:</strong> ${customReason || (fine ? fine.violation.description : 'Administrative adjustment')}</p>
//             ${fine ? `
//               <p><strong>Fine Number:</strong> ${fine.fineNumber}</p>
//               <p><strong>Vehicle:</strong> ${vehicle.registrationNumber}</p>
//               <p><strong>Location:</strong> ${fine.violation.location}</p>
//             ` : ''}
//           </div>
          
//           <div style="background: ${pointsStatus.color === 'red' ? '#fee2e2' : pointsStatus.color === 'orange' ? '#fed7aa' : pointsStatus.color === 'yellow' ? '#fef3c7' : '#d1fae5'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <h4 style="color: ${pointsStatus.color === 'red' ? '#dc2626' : pointsStatus.color === 'orange' ? '#ea580c' : pointsStatus.color === 'yellow' ? '#d97706' : '#059669'}; margin-top: 0;">Current Status: ${pointsStatus.status.toUpperCase()}</h4>
//             <p style="margin: 0; color: ${pointsStatus.color === 'red' ? '#dc2626' : pointsStatus.color === 'orange' ? '#ea580c' : pointsStatus.color === 'yellow' ? '#d97706' : '#059669'};">${pointsStatus.message}</p>
//           </div>
          
//           ${newPoints === 0 ? `
//             <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h4 style="color: #dc2626; margin-top: 0;">⚠️ LICENSE SUSPENDED</h4>
//               <p style="color: #dc2626; margin: 0;">Your driving license has been suspended due to zero points. You cannot legally drive until your license is restored.</p>
//               <p style="color: #dc2626; margin: 10px 0 0 0;"><strong>Suspension Period:</strong> 6 months minimum</p>
//             </div>
//           ` : newPoints <= 20 ? `
//             <div style="background: #fed7aa; border: 2px solid #ea580c; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h4 style="color: #ea580c; margin-top: 0;">⚠️ WARNING: Critical Points Level</h4>
//               <p style="color: #ea580c; margin: 0;">You are at risk of license suspension. Drive carefully to avoid further violations.</p>
//             </div>
//           ` : ''}
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/points" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Points History</a>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: ${pointsDeducted} driving points deducted. Remaining: ${newPoints}/100. ${newPoints === 0 ? 'LICENSE SUSPENDED!' : newPoints <= 20 ? 'WARNING: Low points!' : ''} View: ${process.env.CLIENT_URL}/points`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send points restoration notification
//   static async sendPointsRestorationNotification(user, pointsRestored, newPoints, reason) {
//     const emailSubject = `Driving Points Restored - ${pointsRestored} Points`;
    
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Points Restoration</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Driving Points Restored</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>Great news! Your driving points have been restored.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
//             <h3 style="color: #059669; margin-top: 0;">Points Restoration Details</h3>
//             <p><strong>Points Restored:</strong> ${pointsRestored}</p>
//             <p><strong>Current Points:</strong> ${newPoints}/100</p>
//             <p><strong>Reason:</strong> ${reason}</p>
//           </div>
          
//           <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #065f46;"><strong>Status:</strong> Your driving record has been improved. Continue safe driving to maintain your points.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/points" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Points History</a>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: ${pointsRestored} driving points restored! Current: ${newPoints}/100. Reason: ${reason}. Keep driving safely! View: ${process.env.CLIENT_URL}/points`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send fine issued notification
//   static async sendFineIssuedNotification(user, fine, vehicle) {
//     const emailSubject = `Traffic Fine Issued - ${fine.fineNumber}`;
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Traffic Fine Notice</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Traffic Fine Issued</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>A traffic fine has been issued for your vehicle. Please find the details below:</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
//             <h3 style="color: #dc2626; margin-top: 0;">Fine Details</h3>
//             <p><strong>Fine Number:</strong> ${fine.fineNumber}</p>
//             <p><strong>Vehicle:</strong> ${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})</p>
//             <p><strong>Violation:</strong> ${fine.violation.description}</p>
//             <p><strong>Location:</strong> ${fine.violation.location}</p>
//             <p><strong>Amount:</strong> Rs. ${fine.amount.toLocaleString()}</p>
//             <p><strong>Points Deducted:</strong> ${fine.pointsDeducted}</p>
//             <p><strong>Due Date:</strong> ${new Date(fine.dueDate).toLocaleDateString()}</p>
//           </div>
          
//           <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please pay this fine before the due date to avoid additional penalties.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/fines" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Fine Online</a>
//           </div>
          
//           <p>You can also dispute this fine if you believe it was issued in error.</p>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: Fine ${fine.fineNumber} issued for ${vehicle.registrationNumber}. Amount: Rs.${fine.amount}. Points: -${fine.pointsDeducted}. Due: ${new Date(fine.dueDate).toLocaleDateString()}. Pay: ${process.env.CLIENT_URL}/fines`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send payment confirmation notification
//   static async sendPaymentConfirmationNotification(user, fine, vehicle, paymentReference) {
//     const emailSubject = `Payment Confirmed - ${fine.fineNumber}`;
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Payment Confirmation</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Payment Successfully Processed</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>Your payment has been successfully processed. Thank you for your prompt payment.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
//             <h3 style="color: #059669; margin-top: 0;">Payment Details</h3>
//             <p><strong>Fine Number:</strong> ${fine.fineNumber}</p>
//             <p><strong>Vehicle:</strong> ${vehicle.registrationNumber}</p>
//             <p><strong>Amount Paid:</strong> Rs. ${fine.amount.toLocaleString()}</p>
//             <p><strong>Payment Reference:</strong> ${paymentReference}</p>
//             <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
//           </div>
          
//           <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #065f46;"><strong>Status:</strong> Your fine has been marked as paid. No further action is required.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/fines" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Payment History</a>
//           </div>
          
//           <p>Keep this email as proof of payment for your records.</p>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: Payment confirmed for fine ${fine.fineNumber}. Amount: Rs.${fine.amount}. Reference: ${paymentReference}. Thank you!`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send dispute status update notification
//   static async sendDisputeStatusNotification(user, dispute, fine, vehicle) {
//     const statusText = dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1);
//     const emailSubject = `Dispute ${statusText} - ${fine.fineNumber}`;
    
//     let statusColor = '#6b7280';
//     let statusBg = '#f3f4f6';
//     if (dispute.status === 'approved') {
//       statusColor = '#059669';
//       statusBg = '#d1fae5';
//     } else if (dispute.status === 'rejected') {
//       statusColor = '#dc2626';
//       statusBg = '#fee2e2';
//     } else if (dispute.status === 'under_review') {
//       statusColor = '#2563eb';
//       statusBg = '#dbeafe';
//     }

//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Dispute Update</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Dispute Status Update</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>There has been an update on your dispute for fine ${fine.fineNumber}.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
//             <h3 style="color: ${statusColor}; margin-top: 0;">Dispute Status: ${statusText}</h3>
//             <p><strong>Fine Number:</strong> ${fine.fineNumber}</p>
//             <p><strong>Vehicle:</strong> ${vehicle.registrationNumber}</p>
//             <p><strong>Original Amount:</strong> Rs. ${fine.amount.toLocaleString()}</p>
//             <p><strong>Dispute Reason:</strong> ${dispute.reason.replace('_', ' ')}</p>
//             ${dispute.reviewDate ? `<p><strong>Review Date:</strong> ${new Date(dispute.reviewDate).toLocaleDateString()}</p>` : ''}
//           </div>
          
//           ${dispute.reviewNotes ? `
//             <div style="background: ${statusBg}; padding: 15px; border-radius: 8px; margin: 20px 0;">
//               <h4 style="color: ${statusColor}; margin-top: 0;">Review Notes:</h4>
//               <p style="margin: 0; color: ${statusColor};">${dispute.reviewNotes}</p>
//             </div>
//           ` : ''}
          
//           ${dispute.resolution ? `
//             <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
//               <h4 style="color: #0369a1; margin-top: 0;">Resolution:</h4>
//               <p style="margin: 0; color: #0369a1;">${dispute.resolution}</p>
//             </div>
//           ` : ''}
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/disputes" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dispute Details</a>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: Dispute for fine ${fine.fineNumber} is now ${statusText}. Check your account for details: ${process.env.CLIENT_URL}/disputes`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send vehicle registration confirmation
//   static async sendVehicleRegistrationNotification(user, vehicle) {
//     const emailSubject = `Vehicle Registered Successfully - ${vehicle.registrationNumber}`;
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Vehicle Registration</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Vehicle Successfully Registered</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>Your vehicle has been successfully registered in our system.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
//             <h3 style="color: #059669; margin-top: 0;">Vehicle Details</h3>
//             <p><strong>Registration Number:</strong> ${vehicle.registrationNumber}</p>
//             <p><strong>Make & Model:</strong> ${vehicle.make} ${vehicle.model}</p>
//             <p><strong>Year:</strong> ${vehicle.year}</p>
//             <p><strong>Color:</strong> ${vehicle.color}</p>
//             <p><strong>Type:</strong> ${vehicle.vehicleType}</p>
//           </div>
          
//           <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #1e40af;"><strong>Next Steps:</strong> Ensure your vehicle insurance and license are up to date to avoid penalties.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/vehicles" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Vehicles</a>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: Vehicle ${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model}) successfully registered. Manage at: ${process.env.CLIENT_URL}/vehicles`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send expiry reminder notifications
//   static async sendExpiryReminderNotification(user, vehicle, expirationType, expiryDate) {
//     const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
//     const emailSubject = `${expirationType} Expiry Reminder - ${vehicle.registrationNumber}`;
    
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">TrafficLK - Expiry Reminder</h1>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">${expirationType} Expiry Reminder</h2>
          
//           <p>Dear ${user.firstName} ${user.lastName},</p>
          
//           <p>This is a reminder that your vehicle ${expirationType.toLowerCase()} is expiring soon.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
//             <h3 style="color: #d97706; margin-top: 0;">Expiry Details</h3>
//             <p><strong>Vehicle:</strong> ${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})</p>
//             <p><strong>Type:</strong> ${expirationType}</p>
//             <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
//             <p><strong>Days Remaining:</strong> ${daysUntilExpiry} days</p>
//           </div>
          
//           <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> Please renew your ${expirationType.toLowerCase()} before the expiry date to avoid penalties.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/fines" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Renewal Fee</a>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             This is an automated message from TrafficLK. Please do not reply to this email.
//             <br>For support, contact us at support@trafficlk.gov.lk
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `TrafficLK: ${expirationType} for ${vehicle.registrationNumber} expires in ${daysUntilExpiry} days (${new Date(expiryDate).toLocaleDateString()}). Renew now: ${process.env.CLIENT_URL}/fines`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Send welcome notification for new users
//   static async sendWelcomeNotification(user) {
//     const emailSubject = 'Welcome to TrafficLK - Your Account is Ready';
//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0;">Welcome to TrafficLK</h1>
//           <p style="color: #d1fae5; margin: 10px 0 0 0;">Digital Traffic Fine Management System</p>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//           <h2 style="color: #1f2937;">Welcome, ${user.firstName}!</h2>
          
//           <p>Thank you for registering with TrafficLK, Sri Lanka's modern traffic fine management system.</p>
          
//           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #059669; margin-top: 0;">What you can do with TrafficLK:</h3>
//             <ul style="color: #374151; line-height: 1.6;">
//               <li>View and pay traffic fines online</li>
//               <li>Register and manage your vehicles</li>
//               <li>File disputes for incorrect fines</li>
//               <li>Pay for vehicle insurance and license renewals</li>
//               <li>Schedule emission tests</li>
//               <li>Track payment history and receipts</li>
//               <li>Monitor your driving points (starts at 100)</li>
//             </ul>
//           </div>
          
//           <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <h4 style="color: #1e40af; margin-top: 0;">🎯 Your Driving Points</h4>
//             <p style="margin: 0; color: #1e40af;">You start with <strong>100 driving points</strong>. Keep them by driving safely - violations will deduct points and may lead to license suspension.</p>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.CLIENT_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a>
//           </div>
          
//           <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p style="margin: 0; color: #1e40af;"><strong>Tip:</strong> Start by registering your vehicles to receive automatic notifications about fines and renewals.</p>
//           </div>
          
//           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
//           <p style="color: #6b7280; font-size: 14px;">
//             Need help? Contact our support team at support@trafficlk.gov.lk
//             <br>This is an automated message from TrafficLK.
//           </p>
//         </div>
//       </div>
//     `;

//     const smsMessage = `Welcome to TrafficLK! Your account is ready with 100 driving points. Manage traffic fines, vehicle registrations & more at: ${process.env.CLIENT_URL}`;

//     await Promise.all([
//       this.sendEmail(user.email, emailSubject, emailContent),
//       this.sendSMS(user.phone, smsMessage)
//     ]);
//   }

//   // Core email sending function
//   static async sendEmail(to, subject, htmlContent) {
//     try {
//       const mailOptions = {
//         from: `"TrafficLK" <${process.env.EMAIL_USER}>`,
//         to: to,
//         subject: subject,
//         html: htmlContent
//       };

//       const result = await emailTransporter.sendMail(mailOptions);
//       console.log(`📧 Email sent to ${to}: ${result.messageId}`);
//       return { success: true, messageId: result.messageId };
//     } catch (error) {
//       console.error('❌ Email sending failed:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Core SMS sending function
//   static async sendSMS(phoneNumber, message) {
//     return await SMSService.sendSMS(phoneNumber, message);
//   }

//   // Send bulk notifications
//   static async sendBulkNotifications(users, subject, message, type = 'both') {
//     const promises = [];
    
//     for (const user of users) {
//       if (type === 'email' || type === 'both') {
//         promises.push(this.sendEmail(user.email, subject, message));
//       }
//       if (type === 'sms' || type === 'both') {
//         promises.push(this.sendSMS(user.phone, message));
//       }
//     }
    
//     return await Promise.allSettled(promises);
//   }
// }

// export default NotificationService;

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced email transporter configuration with better error handling
const createEmailTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

const emailTransporter = createEmailTransporter();

// SMS service configuration (disabled by default, focus on emails)
class SMSService {
  static async sendSMS(phoneNumber, message) {
    // SMS is disabled - focusing on email notifications only
    console.log(`📱 SMS disabled. Would send to ${phoneNumber}: ${message}`);
    return { success: true, messageId: `SMS_DISABLED_${Date.now()}`, disabled: true };
  }
}

class NotificationService {
  // Enhanced user registration welcome email
  static async sendWelcomeNotification(user) {
    const emailSubject = '🎉 Welcome to TrafficLK - Your Account is Ready!';
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <div style="background: #ffffff; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <span style="color: #10b981; font-size: 24px; font-weight: bold;">🛡️</span>
            </div>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to TrafficLK!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Sri Lanka's Digital Traffic Fine Management System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${user.firstName}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Congratulations! Your TrafficLK account has been successfully created. You now have access to Sri Lanka's most advanced digital traffic fine management platform.
            </p>

            <!-- Account Details -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📋 Your Account Details</h3>
              <div style="color: #6b7280; line-height: 1.8;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin: 5px 0;"><strong>Account Type:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <!-- Features -->
            <div style="background: white; padding: 25px; border: 2px solid #e5e7eb; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px;">🚀 What you can do with TrafficLK:</h3>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 10px; font-size: 18px;">💳</span>
                  <div>
                    <strong style="color: #374151;">Pay Traffic Fines Online</strong>
                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Secure, instant payments with multiple payment options</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 10px; font-size: 18px;">🚗</span>
                  <div>
                    <strong style="color: #374151;">Vehicle Management</strong>
                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Register and manage all your vehicles in one place</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 10px; font-size: 18px;">⚖️</span>
                  <div>
                    <strong style="color: #374151;">Dispute Resolution</strong>
                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Fair and transparent process to contest fines</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 10px; font-size: 18px;">🏆</span>
                  <div>
                    <strong style="color: #374151;">Driving Points System</strong>
                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Monitor your driving record (you start with 100 points!)</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 10px; font-size: 18px;">🔔</span>
                  <div>
                    <strong style="color: #374151;">Real-time Notifications</strong>
                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Instant alerts for fines, payments, and important updates</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Driving Points Highlight -->
            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 22px;">🎯 Your Driving Points: 100/100</h3>
              <p style="color: #1e40af; margin: 0; line-height: 1.6;">
                You start with a perfect score! Keep driving safely to maintain your points. 
                Violations will deduct points, and reaching zero points will result in license suspension.
              </p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                🚀 Access Your Dashboard
              </a>
            </div>

            <!-- Next Steps -->
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">📝 Recommended Next Steps:</h4>
              <ol style="color: #0369a1; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete your profile information</li>
                <li>Register your vehicles</li>
                <li>Explore the dashboard features</li>
                <li>Set up notification preferences</li>
              </ol>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 15px 0; font-size: 16px;">
            🇱🇰 <strong>Government of Sri Lanka Initiative</strong>
          </p>
          <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 14px;">
            Making traffic fine management digital, transparent, and efficient for all Sri Lankans.
          </p>
          <div style="border-top: 1px solid #4b5563; padding-top: 20px; margin-top: 20px;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Need help? Contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
              <br>This is an automated message from TrafficLK. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const smsMessage = `🎉 Welcome to TrafficLK! Your account is ready with 100 driving points. Access your dashboard: ${process.env.CLIENT_URL}/dashboard`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced fine issued notification
  static async sendFineIssuedNotification(user, fine, vehicle) {
    const emailSubject = `🚨 Traffic Fine Issued - ${fine.fineNumber}`;
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">⚠️</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Traffic Fine Issued</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">Immediate Action Required</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              A traffic fine has been issued for your vehicle. Please review the details below and take appropriate action.
            </p>
            
            <!-- Fine Details -->
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                🚨 Fine Details
              </h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Fine Number:</strong>
                  <span style="color: #991b1b; font-weight: 600;">${fine.fineNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Vehicle:</strong>
                  <span style="color: #991b1b;">${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Violation:</strong>
                  <span style="color: #991b1b;">${fine.violation.description}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Location:</strong>
                  <span style="color: #991b1b;">${fine.violation.location}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Date Issued:</strong>
                  <span style="color: #991b1b;">${new Date(fine.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Due Date:</strong>
                  <span style="color: #991b1b; font-weight: 600;">${new Date(fine.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                  <strong style="color: #7f1d1d; font-size: 18px;">Fine Amount:</strong>
                  <span style="color: #dc2626; font-size: 24px; font-weight: 700;">Rs. ${fine.amount.toLocaleString()}</span>
                </div>
                ${fine.pointsDeducted ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #fee2e2; margin: 10px -10px; padding: 15px; border-radius: 8px;">
                  <strong style="color: #7f1d1d;">Points Deducted:</strong>
                  <span style="color: #dc2626; font-size: 18px; font-weight: 700;">-${fine.pointsDeducted} points</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Payment Options -->
            <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">💳 Payment Options</h3>
              <p style="color: #1e40af; margin: 0 0 20px 0; line-height: 1.6;">
                Pay your fine securely online using any of the following methods:
              </p>
              <ul style="color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Credit/Debit Cards (Visa, MasterCard)</li>
                <li>Online Banking</li>
                <li>Digital Wallets</li>
                <li>Bank Transfer</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/fines" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 0 10px 10px 0; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                💳 Pay Fine Now
              </a>
              <a href="${process.env.CLIENT_URL}/disputes" style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 0 10px 10px 0;">
                ⚖️ Dispute Fine
              </a>
            </div>

            <!-- Important Notice */}
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">⏰ Important Notice</h4>
              <p style="color: #92400e; margin: 0; line-height: 1.6;">
                Please pay this fine before the due date to avoid additional penalties and potential license suspension. 
                Late payments may incur additional charges and affect your driving record.
              </p>
            </div>

            <!-- Dispute Information -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 10px 0;">⚖️ Dispute This Fine</h4>
              <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                If you believe this fine was issued in error, you can file a dispute through our online system. 
                You'll need to provide evidence and a detailed explanation. Disputes are reviewed by qualified officers.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `🚨 TrafficLK: Fine ${fine.fineNumber} issued for ${vehicle.registrationNumber}. Amount: Rs.${fine.amount.toLocaleString()}. ${fine.pointsDeducted ? `Points: -${fine.pointsDeducted}.` : ''} Due: ${new Date(fine.dueDate).toLocaleDateString()}. Pay: ${process.env.CLIENT_URL}/fines`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced payment confirmation notification
  static async sendPaymentConfirmationNotification(user, fine, vehicle, paymentReference) {
    const emailSubject = `✅ Payment Confirmed - ${fine.fineNumber}`;
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">✅</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Payment Confirmed!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">Your fine has been successfully paid</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your payment has been successfully processed. Thank you for your prompt payment and helping keep Sri Lankan roads safe.
            </p>
            
            <!-- Payment Details -->
            <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px;">💳 Payment Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Fine Number:</strong>
                  <span style="color: #047857;">${fine.fineNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Vehicle:</strong>
                  <span style="color: #047857;">${vehicle.registrationNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Payment Reference:</strong>
                  <span style="color: #047857; font-family: monospace;">${paymentReference}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Payment Date:</strong>
                  <span style="color: #047857;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                  <strong style="color: #065f46; font-size: 18px;">Amount Paid:</strong>
                  <span style="color: #059669; font-size: 24px; font-weight: 700;">Rs. ${fine.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <!-- Status Update -->
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
              <h4 style="color: #065f46; margin: 0 0 10px 0;">✅ Status Update</h4>
              <p style="color: #065f46; margin: 0; line-height: 1.6;">
                Your fine has been marked as <strong>PAID</strong> in our system. No further action is required. 
                This payment receipt serves as proof of payment for your records.
              </p>
            </div>

            <!-- Receipt Information -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #475569; margin: 0 0 15px 0;">📄 Receipt Information</h4>
              <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                Please save this email as your official payment receipt. You may need this for:
              </p>
              <ul style="color: #64748b; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Insurance claims</li>
                <li>Legal documentation</li>
                <li>Employer reimbursement</li>
                <li>Tax deduction purposes</li>
              </ul>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/fines" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                📊 View Payment History
              </a>
            </div>

            <!-- Thank You Message -->
            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">🙏 Thank You!</h3>
              <p style="color: #1e40af; margin: 0; line-height: 1.6;">
                Your prompt payment helps maintain road safety and supports infrastructure development in Sri Lanka. 
                We appreciate your cooperation in following traffic regulations.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `✅ TrafficLK: Payment confirmed for fine ${fine.fineNumber}. Amount: Rs.${fine.amount.toLocaleString()}. Reference: ${paymentReference}. Thank you for your prompt payment!`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced points deduction notification
  static async sendPointsDeductionNotification(user, fine, vehicle, pointsDeducted, newPoints, customReason = null) {
    const pointsStatus = user.getPointsStatus();
    const emailSubject = `🚨 Driving Points Deducted - ${pointsDeducted} Points`;
    
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">⚠️</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Driving Points Deducted</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">Important: Your driving record has been updated</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Your driving points have been deducted due to a traffic violation. Please review the details below and take note of your current driving record status.
            </p>
            
            <!-- Points Deduction Details -->
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px;">📉 Points Deduction Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Points Deducted:</strong>
                  <span style="color: #dc2626; font-size: 18px; font-weight: 700;">-${pointsDeducted}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Remaining Points:</strong>
                  <span style="color: ${newPoints <= 20 ? '#dc2626' : newPoints <= 40 ? '#f59e0b' : '#059669'}; font-size: 24px; font-weight: 700;">${newPoints}/100</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Reason:</strong>
                  <span style="color: #991b1b;">${customReason || (fine ? fine.violation.description : 'Administrative adjustment')}</span>
                </div>
                ${fine ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Fine Number:</strong>
                  <span style="color: #991b1b;">${fine.fineNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fecaca;">
                  <strong style="color: #7f1d1d;">Vehicle:</strong>
                  <span style="color: #991b1b;">${vehicle.registrationNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <strong style="color: #7f1d1d;">Location:</strong>
                  <span style="color: #991b1b;">${fine.violation.location}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Current Status -->
            <div style="background: ${pointsStatus.color === 'red' ? '#fee2e2' : pointsStatus.color === 'orange' ? '#fed7aa' : pointsStatus.color === 'yellow' ? '#fef3c7' : '#d1fae5'}; border: 2px solid ${pointsStatus.color === 'red' ? '#fecaca' : pointsStatus.color === 'orange' ? '#fdba74' : pointsStatus.color === 'yellow' ? '#fde68a' : '#bbf7d0'}; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: ${pointsStatus.color === 'red' ? '#dc2626' : pointsStatus.color === 'orange' ? '#ea580c' : pointsStatus.color === 'yellow' ? '#d97706' : '#059669'}; margin: 0 0 15px 0; font-size: 20px;">
                📊 Current Status: ${pointsStatus.status.toUpperCase()}
              </h3>
              <p style="color: ${pointsStatus.color === 'red' ? '#dc2626' : pointsStatus.color === 'orange' ? '#ea580c' : pointsStatus.color === 'yellow' ? '#d97706' : '#059669'}; margin: 0; line-height: 1.6; font-size: 16px;">
                ${pointsStatus.message}
              </p>
            </div>

            ${newPoints === 0 ? `
            <!-- License Suspension Alert -->
            <div style="background: #fee2e2; border: 3px solid #dc2626; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 22px;">🚫 LICENSE SUSPENDED</h3>
              <p style="color: #dc2626; margin: 0 0 15px 0; line-height: 1.6; font-weight: 600;">
                Your driving license has been suspended due to zero points. You cannot legally drive until your license is restored.
              </p>
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>Suspension Period:</strong> 6 months minimum<br>
                  <strong>Restoration Requirements:</strong> Complete defensive driving course and pay restoration fees<br>
                  <strong>Legal Notice:</strong> Driving with a suspended license is a criminal offense
                </p>
              </div>
            </div>
            ` : newPoints <= 20 ? `
            <!-- Critical Warning -->
            <div style="background: #fed7aa; border: 2px solid #ea580c; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 20px;">⚠️ CRITICAL: Risk of License Suspension</h3>
              <p style="color: #ea580c; margin: 0; line-height: 1.6;">
                You are at high risk of license suspension. Drive extremely carefully to avoid further violations. 
                Consider taking a defensive driving course to improve your driving skills.
              </p>
            </div>
            ` : ''}

            <!-- Points System Information -->
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">📚 About the Points System</h4>
              <p style="color: #0369a1; margin: 0 0 15px 0; line-height: 1.6; font-size: 14px;">
                Sri Lanka's driving points system helps maintain road safety:
              </p>
              <ul style="color: #0369a1; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                <li><strong>100-81 points:</strong> Good standing</li>
                <li><strong>80-61 points:</strong> Caution advised</li>
                <li><strong>60-41 points:</strong> Warning level</li>
                <li><strong>40-21 points:</strong> Critical level</li>
                <li><strong>20-1 points:</strong> High risk of suspension</li>
                <li><strong>0 points:</strong> License suspended</li>
              </ul>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/points" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                📊 View Points History
              </a>
            </div>

            <!-- Improvement Tips -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 15px 0;">💡 Tips to Improve Your Driving Record</h4>
              <ul style="color: #6b7280; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Follow all traffic rules and speed limits</li>
                <li>Maintain safe following distances</li>
                <li>Use seat belts and helmets as required</li>
                <li>Avoid using mobile phones while driving</li>
                <li>Regular vehicle maintenance and inspections</li>
                <li>Consider defensive driving courses</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `🚨 TrafficLK: ${pointsDeducted} driving points deducted. Remaining: ${newPoints}/100. ${newPoints === 0 ? 'LICENSE SUSPENDED!' : newPoints <= 20 ? 'WARNING: Low points!' : ''} View: ${process.env.CLIENT_URL}/points`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced points restoration notification
  static async sendPointsRestorationNotification(user, pointsRestored, newPoints, reason) {
    const emailSubject = `🎉 Driving Points Restored - ${pointsRestored} Points`;
    
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">🎉</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Points Restored!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">Your driving record has been improved</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your driving points have been restored. This improvement to your driving record reflects your commitment to safe driving practices.
            </p>
            
            <!-- Points Restoration Details -->
            <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px;">📈 Points Restoration Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Points Restored:</strong>
                  <span style="color: #059669; font-size: 18px; font-weight: 700;">+${pointsRestored}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Current Points:</strong>
                  <span style="color: #059669; font-size: 24px; font-weight: 700;">${newPoints}/100</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <strong style="color: #065f46;">Reason:</strong>
                  <span style="color: #047857;">${reason}</span>
                </div>
              </div>
            </div>

            <!-- Congratulations Message -->
            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">🏆 Congratulations!</h3>
              <p style="color: #1e40af; margin: 0; line-height: 1.6;">
                Your driving record has been improved! Continue practicing safe driving to maintain and further improve your points. 
                You're setting a great example for road safety in Sri Lanka.
              </p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/points" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                📊 View Points History
              </a>
            </div>

            <!-- Safe Driving Tips -->
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">🚗 Keep Up the Good Work</h4>
              <p style="color: #0369a1; margin: 0; line-height: 1.6; font-size: 14px;">
                Continue following traffic rules, maintain your vehicle properly, and drive defensively to keep your points high and contribute to safer roads for everyone.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `🎉 TrafficLK: ${pointsRestored} driving points restored! Current: ${newPoints}/100. Reason: ${reason}. Keep driving safely! View: ${process.env.CLIENT_URL}/points`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced dispute status notification
  static async sendDisputeStatusNotification(user, dispute, fine, vehicle) {
    const statusText = dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1);
    const emailSubject = `⚖️ Dispute ${statusText} - ${fine.fineNumber}`;
    
    let statusColor = '#6b7280';
    let statusBg = '#f3f4f6';
    let statusIcon = '📋';
    
    if (dispute.status === 'approved') {
      statusColor = '#059669';
      statusBg = '#d1fae5';
      statusIcon = '✅';
    } else if (dispute.status === 'rejected') {
      statusColor = '#dc2626';
      statusBg = '#fee2e2';
      statusIcon = '❌';
    } else if (dispute.status === 'under_review') {
      statusColor = '#2563eb';
      statusBg = '#dbeafe';
      statusIcon = '👁️';
    }

    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">${statusIcon}</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Dispute ${statusText}</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Update on your fine dispute</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              There has been an update on your dispute for fine ${fine.fineNumber}. Please review the details below.
            </p>
            
            <!-- Dispute Status -->
            <div style="background: ${statusBg}; border: 2px solid ${statusColor}; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: ${statusColor}; margin: 0 0 20px 0; font-size: 20px;">${statusIcon} Dispute Status: ${statusText}</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${statusColor}33;">
                  <strong style="color: ${statusColor};">Fine Number:</strong>
                  <span style="color: ${statusColor};">${fine.fineNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${statusColor}33;">
                  <strong style="color: ${statusColor};">Vehicle:</strong>
                  <span style="color: ${statusColor};">${vehicle.registrationNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${statusColor}33;">
                  <strong style="color: ${statusColor};">Original Amount:</strong>
                  <span style="color: ${statusColor};">Rs. ${fine.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${statusColor}33;">
                  <strong style="color: ${statusColor};">Dispute Reason:</strong>
                  <span style="color: ${statusColor};">${dispute.reason.replace('_', ' ')}</span>
                </div>
                ${dispute.reviewDate ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <strong style="color: ${statusColor};">Review Date:</strong>
                  <span style="color: ${statusColor};">${new Date(dispute.reviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                ` : ''}
              </div>
            </div>

            ${dispute.reviewNotes ? `
            <!-- Review Notes -->
            <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 25px 0;">
              <h4 style="color: ${statusColor}; margin: 0 0 15px 0;">📝 Review Notes:</h4>
              <p style="color: ${statusColor}; margin: 0; line-height: 1.6;">${dispute.reviewNotes}</p>
            </div>
            ` : ''}
            
            ${dispute.resolution ? `
            <!-- Resolution -->
            <div style="background: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">⚖️ Resolution:</h4>
              <p style="color: #0369a1; margin: 0; line-height: 1.6;">${dispute.resolution}</p>
            </div>
            ` : ''}

            <!-- Next Steps -->
            ${dispute.status === 'approved' ? `
            <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h4 style="color: #059669; margin: 0 0 15px 0;">✅ Dispute Approved - Next Steps</h4>
              <p style="color: #059669; margin: 0; line-height: 1.6;">
                Your dispute has been approved! The fine has been cancelled and no payment is required. 
                If you already paid this fine, a refund will be processed within 5-7 business days.
              </p>
            </div>
            ` : dispute.status === 'rejected' ? `
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h4 style="color: #dc2626; margin: 0 0 15px 0;">❌ Dispute Rejected - Next Steps</h4>
              <p style="color: #dc2626; margin: 0 0 15px 0; line-height: 1.6;">
                Your dispute has been reviewed and rejected. The original fine remains valid and must be paid by the due date.
              </p>
              <p style="color: #dc2626; margin: 0; line-height: 1.6; font-size: 14px;">
                If you disagree with this decision, you may appeal to the Magistrate's Court within 14 days of this notification.
              </p>
            </div>
            ` : `
            <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h4 style="color: #2563eb; margin: 0 0 15px 0;">👁️ Under Review</h4>
              <p style="color: #2563eb; margin: 0; line-height: 1.6;">
                Your dispute is currently being reviewed by our qualified officers. We will notify you once a decision has been made.
              </p>
            </div>
            `}

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/disputes" style="background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px ${statusColor}33;">
                📋 View Dispute Details
              </a>
            </div>

            <!-- Legal Information -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 15px 0;">⚖️ Legal Information</h4>
              <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                This dispute decision is made in accordance with Sri Lankan traffic laws and regulations. 
                If you have questions about the legal process, you may consult with a legal advisor or contact our support team.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `⚖️ TrafficLK: Dispute for fine ${fine.fineNumber} is now ${statusText}. ${dispute.status === 'approved' ? 'Fine cancelled!' : dispute.status === 'rejected' ? 'Payment required.' : 'Under review.'} Details: ${process.env.CLIENT_URL}/disputes`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced vehicle registration notification
  static async sendVehicleRegistrationNotification(user, vehicle) {
    const emailSubject = `🚗 Vehicle Registered Successfully - ${vehicle.registrationNumber}`;
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">🚗</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Vehicle Registered!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">Successfully added to your account</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Your vehicle has been successfully registered in the TrafficLK system. You can now manage all traffic-related activities for this vehicle through your dashboard.
            </p>
            
            <!-- Vehicle Details -->
            <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px;">🚗 Vehicle Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Registration Number:</strong>
                  <span style="color: #047857; font-weight: 600; font-size: 16px;">${vehicle.registrationNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Make & Model:</strong>
                  <span style="color: #047857;">${vehicle.make} ${vehicle.model}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Year:</strong>
                  <span style="color: #047857;">${vehicle.year}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                  <strong style="color: #065f46;">Color:</strong>
                  <span style="color: #047857;">${vehicle.color}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <strong style="color: #065f46;">Type:</strong>
                  <span style="color: #047857; text-transform: capitalize;">${vehicle.vehicleType}</span>
                </div>
              </div>
            </div>

            <!-- What's Next -->
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0;">📋 What's Next?</h4>
              <ul style="color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Ensure your vehicle insurance is up to date</li>
                <li>Keep your vehicle license current</li>
                <li>Schedule regular emission tests as required</li>
                <li>You'll receive automatic notifications for any traffic fines</li>
                <li>Monitor your vehicle's compliance status through your dashboard</li>
              </ul>
            </div>

            <!-- Benefits -->
            <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0;">🎯 Benefits of Registration</h4>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">🔔</span>
                  <div>
                    <strong style="color: #1e40af;">Instant Notifications</strong>
                    <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">Get immediate alerts for any traffic fines or violations</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">💳</span>
                  <div>
                    <strong style="color: #1e40af;">Easy Online Payments</strong>
                    <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">Pay fines, insurance, and renewals directly from your account</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">📊</span>
                  <div>
                    <strong style="color: #1e40af;">Complete History</strong>
                    <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">Access all vehicle-related records and documents</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">⚖️</span>
                  <div>
                    <strong style="color: #1e40af;">Dispute Management</strong>
                    <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">File and track disputes for any incorrect fines</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/vehicles" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                🚗 Manage Vehicles
              </a>
            </div>

            <!-- Important Reminders */
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
              <h4 style="color: #92400e; margin: 0 0 15px 0;">⚠️ Important Reminders</h4>
              <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Keep your vehicle insurance and license up to date to avoid penalties</li>
                <li>Ensure regular emission testing as per Sri Lankan regulations</li>
                <li>Update your contact information if it changes</li>
                <li>Report any vehicle ownership changes immediately</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `🚗 TrafficLK: Vehicle ${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model}) successfully registered. Manage at: ${process.env.CLIENT_URL}/vehicles`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Enhanced expiry reminder notification
  static async sendExpiryReminderNotification(user, vehicle, expirationType, expiryDate) {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    const emailSubject = `⏰ ${expirationType} Expiry Reminder - ${vehicle.registrationNumber}`;
    
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">⏰</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${expirationType} Expiry Reminder</h1>
          <p style="color: #fde68a; margin: 10px 0 0 0; font-size: 14px;">Action required within ${daysUntilExpiry} days</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Dear ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              This is an important reminder that your vehicle ${expirationType.toLowerCase()} is expiring soon. Please take immediate action to avoid penalties and ensure continued legal compliance.
            </p>
            
            <!-- Expiry Details -->
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #d97706; margin: 0 0 20px 0; font-size: 20px;">⏰ Expiry Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                  <strong style="color: #92400e;">Vehicle:</strong>
                  <span style="color: #b45309;">${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                  <strong style="color: #92400e;">Document Type:</strong>
                  <span style="color: #b45309;">${expirationType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                  <strong style="color: #92400e;">Expiry Date:</strong>
                  <span style="color: #b45309; font-weight: 600;">${new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                  <strong style="color: #92400e; font-size: 18px;">Days Remaining:</strong>
                  <span style="color: #d97706; font-size: 24px; font-weight: 700;">${daysUntilExpiry} days</span>
                </div>
              </div>
            </div>

            <!-- Urgency Alert -->
            ${daysUntilExpiry <= 7 ? `
            <div style="background: #fee2e2; border: 3px solid #dc2626; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">🚨 URGENT: Immediate Action Required</h3>
              <p style="color: #dc2626; margin: 0; line-height: 1.6; font-weight: 600;">
                Your ${expirationType.toLowerCase()} expires in ${daysUntilExpiry} days! Driving with expired documents is illegal and may result in heavy fines and vehicle impoundment.
              </p>
            </div>
            ` : daysUntilExpiry <= 14 ? `
            <div style="background: #fed7aa; border: 2px solid #ea580c; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">⚠️ Action Required Soon</h3>
              <p style="color: #ea580c; margin: 0; line-height: 1.6;">
                Please renew your ${expirationType.toLowerCase()} before the expiry date to avoid penalties and ensure continuous legal compliance.
              </p>
            </div>
            ` : ''}

            <!-- Consequences of Expiry -->
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0;">
              <h4 style="color: #dc2626; margin: 0 0 15px 0;">⚠️ Consequences of Expired ${expirationType}</h4>
              <ul style="color: #dc2626; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                ${expirationType === 'Insurance' ? `
                <li>Heavy fines up to Rs. 25,000</li>
                <li>Vehicle impoundment</li>
                <li>No coverage for accidents or damages</li>
                <li>Legal liability for third-party damages</li>
                <li>Difficulty in vehicle registration renewal</li>
                ` : expirationType === 'License' ? `
                <li>Fines up to Rs. 15,000</li>
                <li>Vehicle impoundment until renewal</li>
                <li>Cannot legally operate the vehicle</li>
                <li>Issues with insurance claims</li>
                <li>Problems during police checks</li>
                ` : `
                <li>Fines and penalties</li>
                <li>Legal compliance issues</li>
                <li>Potential vehicle restrictions</li>
                <li>Administrative complications</li>
                `}
              </ul>
            </div>

            <!-- Renewal Process -->
            <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0;">📋 How to Renew</h4>
              <ol style="color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px;">
                ${expirationType === 'Insurance' ? `
                <li>Contact your insurance provider or visit their website</li>
                <li>Review and update your policy details</li>
                <li>Make the premium payment</li>
                <li>Receive your new insurance certificate</li>
                <li>Update the information in your TrafficLK account</li>
                ` : expirationType === 'License' ? `
                <li>Visit the nearest DMT office or authorized agent</li>
                <li>Bring required documents (NIC, current license, etc.)</li>
                <li>Pay the renewal fee</li>
                <li>Complete any required inspections</li>
                <li>Receive your renewed license</li>
                ` : `
                <li>Visit the relevant government office</li>
                <li>Bring required documentation</li>
                <li>Complete necessary forms</li>
                <li>Pay applicable fees</li>
                <li>Receive renewed documentation</li>
                `}
              </ol>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/fines" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                💳 Pay Renewal Fee
              </a>
            </div>

            <!-- Contact Information -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 15px 0;">📞 Need Help?</h4>
              <p style="color: #6b7280; margin: 0 0 10px 0; line-height: 1.6; font-size: 14px;">
                If you need assistance with the renewal process, contact:
              </p>
              <ul style="color: #6b7280; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                ${expirationType === 'Insurance' ? `
                <li>Your insurance provider directly</li>
                <li>Insurance Association of Sri Lanka: +94 11 2 691 394</li>
                ` : expirationType === 'License' ? `
                <li>Department of Motor Traffic: +94 11 2 421 161</li>
                <li>Nearest DMT office</li>
                ` : `
                <li>Relevant government department</li>
                <li>TrafficLK support: support@trafficlk.gov.lk</li>
                `}
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            🇱🇰 <strong>TrafficLK - Government of Sri Lanka</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            For support, contact us at <a href="mailto:support@trafficlk.gov.lk" style="color: #10b981;">support@trafficlk.gov.lk</a>
            <br>This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const smsMessage = `⏰ TrafficLK: ${expirationType} for ${vehicle.registrationNumber} expires in ${daysUntilExpiry} days (${new Date(expiryDate).toLocaleDateString()}). Renew now to avoid penalties: ${process.env.CLIENT_URL}/fines`;

    await Promise.all([
      this.sendEmail(user.email, emailSubject, emailContent),
      this.sendSMS(user.phone, smsMessage)
    ]);
  }

  // Core email sending function with enhanced error handling
  static async sendEmail(to, subject, htmlContent) {
    try {
      if (!emailTransporter) {
        console.error('❌ Email transporter not configured');
        return { success: false, error: 'Email service not configured' };
      }

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials not configured');
        return { success: false, error: 'Email credentials not configured' };
      }

      const mailOptions = {
        from: `"TrafficLK - Government of Sri Lanka" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const result = await emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Core SMS sending function (disabled)
  static async sendSMS(phoneNumber, message) {
    return await SMSService.sendSMS(phoneNumber, message);
  }

  // Send bulk notifications
  static async sendBulkNotifications(users, subject, message, type = 'email') {
    const promises = [];
    
    for (const user of users) {
      if (type === 'email' || type === 'both') {
        promises.push(this.sendEmail(user.email, subject, message));
      }
      if (type === 'sms' || type === 'both') {
        promises.push(this.sendSMS(user.phone, message));
      }
    }
    
    return await Promise.allSettled(promises);
  }

  // Test email configuration
  static async testEmailConfiguration() {
    try {
      if (!emailTransporter) {
        return { success: false, error: 'Email transporter not configured' };
      }

      await emailTransporter.verify();
      console.log('✅ Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;