'use server';
import axios from "axios";
import db from "@/db/index"
import { fetchAllUsers, fetchUserId } from "./media";
import { createUserChat } from "@/components/ui/sections/api";
import { getSession } from "next-auth/react";
import AWS from 'aws-sdk'


export const check_connection=async(requesterEmail:string,recipientEmail:string)=>{
  if (!requesterEmail || !recipientEmail ) {
    throw new Error(' requesterEmail ,recipientEmail and StrengthLevel are required.');
  }

  // Retrieve user IDs based on emails
  const requester = await db.user.findUnique({
    where: { email: requesterEmail },
  });

  const recipient = await db.user.findUnique({
    where: { email: recipientEmail },
  });

  if (!requester || !recipient) {
    throw new Error('One or both emails are not associated with a valid user.');
  }

  const { id: requesterId } = requester;
  const { id: recipientId } = recipient;

  const existingConnection = await db.connection.findFirst({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      OR: [
        { requesterId, recipientId }, // Original direction
        { requesterId: recipientId, recipientId: requesterId }, // Reversed direction
      ],
    },
  });
  if (existingConnection) {
      return true
  }
  return false

}


// AWS SES Configuration
  // Replace with your verified sender email
const CHARSET = "UTF-8";
const AWS_REGION = "us-east-1";

AWS.config.update({
  region: AWS_REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
});

const ses = new AWS.SES();

// Email sending function
const sendEmail = async (recipientEmail,subject, bodyText, bodyHtml) => {
  const params = {
    Source: process.env.SENDER,
    Destination: {
      ToAddresses: [recipientEmail]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: CHARSET
      },
      Body: {
        Text: {
          Data: bodyText,
          Charset: CHARSET
        },
        Html: {
          Data: bodyHtml,
          Charset: CHARSET
        }
      }
    }
  };

  try {
    const data = await ses.sendEmail(params).promise();
    console.log("Email sent! Message ID: ", data.MessageId);
    return { success: true, messageId: data.MessageId };
  } catch (err) {
    console.error("Error sending email: ", err);
    return { success: false, error: err.message };
  }
};

// Usage Example
const sendConnectionRequestEmail = async (recipientEmail,requesterName,requesterEmail,strengthLevel) => {
  const subject = "New Connection Request";
  const bodyText = `${requesterEmail} has requested to connect with you. The strength level of this connection is ${strengthLevel}.`;
  const bodyHtml = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Connection Request</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.s {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.i {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.bk { padding-top:5px!important } .bj { padding-bottom:5px!important } .bi { padding-top:40px!important } .bh { padding-bottom:15px!important }  *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important }  .be p { } .bd p { } .bc p { } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left }       .g td a { font-size:14px!important } .bf p, .bf a { font-size:14px!important } .be p, .be a { font-size:14px!important } .bd p, .bd a { font-size:16px!important } .bc p, .bc a { font-size:12px!important } .z, .z h1, .z h2, .z h3, .z h4, .z h5, .z h6 { text-align:center!important }     .y .rollover:hover .rollover-second, .z .rollover:hover .rollover-second, .ba .rollover:hover .rollover-second { display:inline!important }   a.s, button.s { font-size:18px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.s, button.s, .w { display:inline-block!important }  .r, .r .s, .t, .t td, .g { display:inline-block!important }  .l table, .m table, .n table, .l, .n, .m { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important }      .g td { width:1%!important } table.f, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .img-2725 { height:151px!important } h1 a { text-align:left } h2 a { text-align:left } h3 a { text-align:left } .d .e, .d .e * { font-size:16px!important; line-height:150%!important } .a .b.c, .a .b.c * { font-size:20px!important; line-height:150%!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f6f6f6"></v:fill>
			</v:background>
		<![endif]-->
   <table cellspacing="0" cellpadding="0" width="100%" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellspacing="0" cellpadding="0" align="center" class="m" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="bf" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" role="none">
             <tr>
              <td bgcolor="#ffffff" align="left" style="padding:10px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://connect.coryfi.com" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"><img src="https://ekcpefh.stripocdn.email/content/guids/CABINET_58374735cbe51047ab668e973a968c91de21257e54d4f75892e31f0139faeacb/images/image.png" alt="" height="140" class="img-2725" width="215" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="a" style="padding:0;Margin:0"><h2 class="z c b" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#000000">New Connection Request</h2></td>
                     </tr>
                     <tr>
                      <td align="center" class="d" style="padding:0;Margin:0"><p class="e" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#000000;font-size:16px">Strength Level ${strengthLevel};</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:5px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:590px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:15px;padding-right:25px;padding-bottom:10px"><h3 class="z" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#000000">${requesterName}</h3></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:25px;padding-bottom:10px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#000000;font-size:14px">has sent you a connection request</p></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:10px;padding-right:10px;padding-bottom:15px"><span class="w" style="border-style:solid;border-color:#333333;background:#000000;border-width:0;display:inline-block;border-radius:20px;width:auto;border-left-color:#2cb543"><a href="https://connect.coryfi.com/" target="_blank" class="s" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px;display:inline-block;background:#000000;border-radius:20px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #000000">See Profile</a></span></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="n" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table align="center" cellpadding="0" cellspacing="0" class="bd" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none">
             <tr>
              <td align="left" bgcolor="#ffffff" class="bk bj" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bi" style="padding:0;Margin:0;padding-bottom:15px;padding-top:35px;font-size:0">
                       <table cellpadding="0" cellspacing="0" class="f t" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://x.com/CoryfiConnect" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="X" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/x-logo-black.png" alt="X" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://www.linkedin.com/company/coryfi-connect/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="LinkedIn" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png" alt="In" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://www.reddit.com/r/Coryfi/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="Reddit" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/reddit-logo-black.png" alt="Reddit" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bh bk" style="padding:0;Margin:0;padding-bottom:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Coryfi Connect © 2025 Coryfi Connect Pvt Ltd</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">All Rights Reserved.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Contact: support@coryfi.com</p></td>
                     </tr>
                     <tr>
                      <td class="bc" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" width="100%" class="g" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links">
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://connect.coryfi.com" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Visit Us </a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1rOu9NfpS6kG3Glj4uM3sftEWwCzH5HTZ/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1m99JCl8X2eEAlQejePDemZPr4Xi-zi-g/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
`;



  const result = await sendEmail(recipientEmail, subject, bodyText, bodyHtml);
  return result;
};

// Example usage
// const requesterEmail = "priyanshu@coryfi.com";
// const recipientEmail = "sgarvit22@gmail.com";
// const strengthLevel = 5;

// sendConnectionRequestEmail(recipientEmail, requesterEmail, strengthLevel);

export const connect_users = async (
  requesterEmail: string,
  requesterName:string,
  recipientEmail: string,
  StrengthLevel: any
) => {
  console.log("Strength Level", StrengthLevel);
  console.log("emails", requesterEmail, recipientEmail);
  try {
    // Validate input
    if (!requesterEmail || !recipientEmail || !StrengthLevel) {
      throw new Error("RequesterEmail, recipientEmail, and StrengthLevel are required.");
    }

    // Retrieve user IDs based on emails
    const requester = await db.user.findUnique({
      where: { email: requesterEmail },
    });

    const recipient = await db.user.findUnique({
      where: { email: recipientEmail },
    });

    if (!requester || !recipient) {
      throw new Error("One or both emails are not associated with a valid user.");
    }

    const { id: requesterId } = requester;
    const { id: recipientId } = recipient;

    // Check if there is an existing connection with status PENDING or APPROVED
    const existingConnection = await db.connection.findFirst({
      where: {
        status: { in: ["PENDING", "APPROVED"] }, // Block if status is PENDING or APPROVED
        OR: [
          { requesterId, recipientId }, // Original direction
          { requesterId: recipientId, recipientId: requesterId }, // Reversed direction
        ],
      },
    });

    if (existingConnection) {
      console.log("Connection already exists:", existingConnection.status);
      throw new Error("A connection request already exists with status PENDING or APPROVED.");
    }

    // Create a new connection request (allowed if no PENDING or APPROVED status exists)
    const connection = await db.connection.create({
      data: {
        requesterId,
        recipientId,
        StrengthLevel,
        status: "PENDING", // Initial status
      },
    });
    // await notifyUserOnConnections(recipientId,requesterName,StrengthLevel)
    console.log("creating random")
    
    console.log("created random")
     await db.notification.create({
      data: {
        userId: recipientId,
        senderName: requesterName,
        senderId: requesterId,
        senderMail:requesterEmail,
        type: "Connection",
        content: `${requesterName} ${StrengthLevel}`,
        isRead: false
      },
    });
    await sendConnectionRequestEmail(recipientEmail,requesterName,requesterEmail,StrengthLevel);

    return { success: true, connection };
  } catch (error) {
    console.error("Error creating connection request:", error);
    return { success: false, error: error.message };
  }
};  

export const notifyUserOnConnections = async (recipientId: number, requesterName: string, strengthLevel: number) => {
  try {
    console.log(recipientId, requesterName, strengthLevel, "creating connection");

    const notify = await db.notification.create({
      data: {
        userId: recipientId,
        type: "Connection",
        content: `${requesterName} ${strengthLevel}`,
        isRead: false
      },
    });

    return { success: true, notify };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, message: "Failed to create notification" };
  }
};

const sendApprovalRequestEmail=async(requesterEmail:string,recipientName)=>{
  const subject = "Connection Request Accepted";
  const bodyText = `Congratulations!! your connection request has been approved .`;
  const bodyHtml = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Connection Request Approved</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.s {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.i {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.bk { padding-top:5px!important } .bj { padding-bottom:5px!important } .bi { padding-top:40px!important } .bh { padding-bottom:15px!important }  *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important }  .be p { } .bd p { } .bc p { } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left }       .g td a { font-size:14px!important } .bf p, .bf a { font-size:14px!important } .be p, .be a { font-size:14px!important } .bd p, .bd a { font-size:16px!important } .bc p, .bc a { font-size:12px!important } .z, .z h1, .z h2, .z h3, .z h4, .z h5, .z h6 { text-align:center!important }     .y .rollover:hover .rollover-second, .z .rollover:hover .rollover-second, .ba .rollover:hover .rollover-second { display:inline!important }   a.s, button.s { font-size:18px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.s, button.s, .w { display:inline-block!important }  .r, .r .s, .t, .t td, .g { display:inline-block!important }  .l table, .m table, .n table, .l, .n, .m { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important }      .g td { width:1%!important } table.f, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .img-2725 { height:151px!important } h1 a { text-align:left } h2 a { text-align:left } h3 a { text-align:left } .d .e, .d .e * { font-size:16px!important; line-height:150%!important } .a .b.c, .a .b.c * { font-size:20px!important; line-height:150%!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f6f6f6"></v:fill>
			</v:background>
		<![endif]-->
   <table cellspacing="0" cellpadding="0" width="100%" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellspacing="0" cellpadding="0" align="center" class="m" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="bf" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" role="none">
             <tr>
              <td bgcolor="#ffffff" align="left" style="padding:10px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://connect.coryfi.com" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"><img src="https://ekcpefh.stripocdn.email/content/guids/CABINET_58374735cbe51047ab668e973a968c91de21257e54d4f75892e31f0139faeacb/images/image.png" alt="" height="140" class="img-2725" width="215" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="a" style="padding:0;Margin:0"><h2 class="z c b" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#000000">Connection Request Accepted</h2></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:5px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:590px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:15px;padding-right:25px;padding-bottom:10px"><h3 class="z" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#000000">${recipientName}</h3></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:25px;padding-bottom:10px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#000000;font-size:14px">has accepted your connection request</p></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:10px;padding-right:10px;padding-bottom:15px"><span class="w" style="border-style:solid;border-color:#333333;background:#000000;border-width:0;display:inline-block;border-radius:20px;width:auto;border-left-color:#2cb543"><a href="https://connect.coryfi.com/" target="_blank" class="s" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px;display:inline-block;background:#000000;border-radius:20px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #000000">See Profile</a></span></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="n" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table align="center" cellpadding="0" cellspacing="0" class="bd" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none">
             <tr>
              <td align="left" bgcolor="#ffffff" class="bk bj" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bi" style="padding:0;Margin:0;padding-bottom:15px;padding-top:35px;font-size:0">
                       <table cellpadding="0" cellspacing="0" class="f t" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://x.com/CoryfiConnect" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="X" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/x-logo-black.png" alt="X" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://www.linkedin.com/company/coryfi-connect/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="LinkedIn" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png" alt="In" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://www.reddit.com/r/Coryfi/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="Reddit" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/reddit-logo-black.png" alt="Reddit" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bh bk" style="padding:0;Margin:0;padding-bottom:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Coryfi Connect © 2025 Coryfi Connect Pvt Ltd</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">All Rights Reserved.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Contact: support@coryfi.com</p></td>
                     </tr>
                     <tr>
                      <td class="bc" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" width="100%" class="g" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links">
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://connect.coryfi.com" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Visit Us </a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1rOu9NfpS6kG3Glj4uM3sftEWwCzH5HTZ/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1m99JCl8X2eEAlQejePDemZPr4Xi-zi-g/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
  `;



  const result = await sendEmail(requesterEmail, subject, bodyText, bodyHtml);
  return result;

}
export const approve_request = async (requesterEmail: string, recipientEmail: string,recipientName:string,notifyId:number) => {
    try {
      // Validate input
      if (!requesterEmail || !recipientEmail) {
        throw new Error('Both requesterEmail and recipientEmail are required.');
      }
  
      // Retrieve user IDs based on emails
      const requester = await db.user.findUnique({
        where: { email: requesterEmail },
      });
  
      const recipient = await db.user.findUnique({
        where: { email: recipientEmail },
      });
  
      if (!requester || !recipient) {
        throw new Error('One or both emails are not associated with a valid user.');
      }
  
      const { id: requesterId } = requester;
      const { id: recipientId } = recipient;
  
      // Check if a connection request exists
      const connectionRequest = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Sort by creation time, descending
        },
      });
  
      if (!connectionRequest) {
        throw new Error('No connection request found.');
      }
  
      if (connectionRequest.status !== 'PENDING') {
        throw new Error('The connection request is not in a pending state.');
      }
  
      // Update the connection status to APPROVED
      const updatedConnection = await db.connection.update({
        where: {
          id:connectionRequest.id
        },
        data: {
          status: 'APPROVED',
        },
      });
      notification_read(notifyId,"accepted")
      sendApprovalRequestEmail(requesterEmail,recipientName)
  
      return { success: true, connection: updatedConnection };
    } catch (error) {
      console.error('Error approving connection request:', error);
      return { success: false, error: error.message };
    }
  };
  export const reject_request = async (requesterEmail: string, recipientEmail: string,notifyId:number) => {
    try {
      // Validate input
      if (!requesterEmail || !recipientEmail) {
        throw new Error('Both requesterEmail and recipientEmail are required.');
      }
  
      // Retrieve user IDs based on emails
      const requester = await db.user.findUnique({
        where: { email: requesterEmail },
      });
  
      const recipient = await db.user.findUnique({
        where: { email: recipientEmail },
      });
  
      if (!requester || !recipient) {
        throw new Error('One or both emails are not associated with a valid user.');
      }
  
      const { id: requesterId } = requester;
      const { id: recipientId } = recipient;
  
      // Check if a connection request exists
      const connectionRequest = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId, recipientId },
            { requesterId: recipientId, recipientId: requesterId },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Sort by creation time in descending order
        },
      });
  
      if (!connectionRequest) {
        throw new Error('No connection request found.');
      }
  
      if (connectionRequest.status !== 'PENDING') {
        throw new Error('The connection request is not in a pending state.');
      }
  
      // Update the connection status to APPROVED
      const updatedConnection = await db.connection.update({
        where: {
          id:connectionRequest.id
        },
        data: {
          status: 'REJECTED',
        },
      });
      await notification_read(notifyId,"rejected")
  
      return { success: true, connection: updatedConnection };
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      return { success: false, error: error.message };
    }
  };
  
  export const notification_read=async(notifyId:number,status)=>{
    await db.notification.update({
      where : {
          id:notifyId
      },
      data:{
        isRead:true,
        status
      }
    })
    return 
  }
  // Fetch all new connection requests for a user
  export const get_requests = async (email: string) => {
    const notifications = await db.notification.findMany({
      where: {
        user: {
          email,
        },
        // OR: [
        //   { isRead: false },  // Unread notifications
        //   { isRead: true, status: "accepted" } // Read notifications with status "ACCEPTED"
        //   {isRead:true, status }
        // ],
      },
      select: {
        id: true,
        senderName: true,
        senderMail: true,
        senderId: true,
        type: true,
        content: true,
        isRead: true,
        status: true, // Ensure status is included
        createdAt: true,
      },
    });
  
    return notifications;
  };
  export const get_new_requests = async (email: string) => {
    try {
      // Validate input
      if (!email) {
        
        throw new Error('Email is required.');
      }
  
      // Retrieve user ID based on email
      const user = await db.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        throw new Error('No user found with the given email.');
      }
      const { id: recipientId } = user;
      const newRequests = await db.connection.findMany({
        where: {
          recipientId,
          status: 'PENDING',
        },
        include: {
          requester: true, // Include requester details
          
        },
      });
  
      return { success: true, requests: newRequests };
    } catch (error) {
      console.error('Error fetching new connection requests:', error);
      return { success: false, error: error.message };
    }
  };
export const intermediaryUserList=async(list:any)=>{
  console.log("intermediataryUserList",list)
  return list;
}
export const createConnectionRequest = async (
  requesterEmail: string,
  recipientEmail: string,
  intermediaries: { email: string }[] // Array of intermediary users (email-based)
) => {
  try {
    console.log(`Requester: ${requesterEmail}, Recipient: ${recipientEmail}`);
    
    // Input validation
    if (!requesterEmail || !recipientEmail || intermediaries.length === 0) {
      throw new Error("Requester, recipient, and intermediaries are required.");
    }

    if (typeof requesterEmail !== "string" || typeof recipientEmail !== "string") {
      throw new Error("Requester and recipient emails must be strings.");
    }

    // Prepare intermediary emails
    const intermediaryEmails = intermediaries.map((intermediary) => intermediary.email);

    // Batch database calls for requester, recipient, and intermediaries
    const [users, unorderedIntermediaryUsers] = await Promise.all([
      db.user.findMany({
        where: { email: { in: [requesterEmail, recipientEmail] } },
      }),
      db.user.findMany({
        where: { email: { in: intermediaryEmails } },
      }),
    ]);

    // Extract requester and recipient from users
    const requester = users.find((user) => user.email === requesterEmail);
    const recipient = users.find((user) => user.email === recipientEmail);

    if (!requester) throw new Error(`Requester with email ${requesterEmail} not found.`);
    if (!recipient) throw new Error(`Recipient with email ${recipientEmail} not found.`);
    if (unorderedIntermediaryUsers.length !== intermediaries.length) {
      throw new Error("One or more intermediaries not found.");
    }

    console.log("Requester, Recipient, and Intermediary users fetched successfully.");

    // Reorder intermediary users using Map for efficiency
    const intermediaryMap = new Map(
      unorderedIntermediaryUsers.map((user) => [user.email, user])
    );
    const orderedIntermediaryUsers = intermediaryEmails.map((email) => intermediaryMap.get(email));
    if (orderedIntermediaryUsers.includes(undefined)) {
      throw new Error("Failed to reorder intermediary users.");
    }

    console.log("Intermediary users reordered successfully.");

    // Create the Evaluation record
    const evaluation = await db.evaluation.create({
      data: {
        requesterId: requester.id,
        recipientId: recipient.id,
        status: "ONGOING",
      },
    });

    console.log("Evaluation created:", evaluation);

    // Create the Connection entry
    const connection = await db.evaluationApprovals.create({
      data: {
        evaluationIds: [evaluation.id],
        requesterId: requester.id,
        recipientId: recipient.id,
        status: "PENDING",
        createdAt: new Date(),
      },
    });

    console.log("Connection created:", connection);

    // Create Path records for intermediaries
    const pathsData = orderedIntermediaryUsers.map((intermediary, index) => ({
      evaluationId: evaluation.id,
      intermediaryId: intermediary.id,
      order: index + 1,
      new_order: index === 0 ? 1 : -1, // Initialize `new_order`
      approved: "FALSE",
    }));

    await db.path.createMany({ data: pathsData });

    console.log("Paths created successfully:", pathsData);

    // Fetch IDs for chat creation
    const [id1, id2] = await Promise.all([
      axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${orderedIntermediaryUsers[0].email}`),
      axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${requesterEmail}`),
    ]);

    console.log("Fetched user IDs:", id1.data.data._id, id2.data.data._id);

    // Create chat
    try {
      const chatResponse = await createUserChat(id2.data.data._id, id1.data.data._id);
      console.log("Chat created successfully:", chatResponse.data.data);
    } catch (error) {
      console.error("Error creating chat:", error);
    }

    return {
      success: true,
      message: "Connection request created successfully.",
      evaluationId: evaluation.id,
    };
  } catch (error) {
    console.error("Error creating connection request:", error);
    return { success: false, error: error.message };
  }
};
export const handleRejection = async (
  evaluationId: number,
  rejectingUserEmail: string
) => {
  try {
    console.log(`Handling rejection for Evaluation ID: ${evaluationId}`);

    // Fetch the evaluation to ensure it exists
    const evaluation = await db.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error("Evaluation not found.");
    }

    console.log(
      `Evaluation found. Status: ${evaluation.status}. Checking rejecting user...`
    );

    // Fetch the connection details to get the recipient and intermediary details
    const connection = await db.evaluationApprovals.findFirst({
      where: {
        evaluationIds:{
          has:evaluationId
        },
      },
    });

    if (!connection) {
      throw new Error("Connection not found for this evaluation.");
    }

    console.log(`Connection found. Evaluating rejection status...`);

    // Identify if the rejecting user is the final recipient or an intermediary
    // const isFinalRecipient = connection.recipientEmail === rejectingUserEmail;
    const rejectingUser=await db.user.findUnique({
      where:{
        email:rejectingUserEmail
      }
    })
    const isFinalRecipient=rejectingUser.email===rejectingUserEmail;
    if (!isFinalRecipient) {
      // Check if the rejecting user is an intermediary
      const intermediaryPath = await db.path.findFirst({
        where: {
          evaluationId,
          intermediaryId: rejectingUser.id,
        },
      });

      if (!intermediaryPath) {
        throw new Error("Rejecting user is neither an intermediary nor the final recipient.");
      }

      console.log("Rejecting user is an intermediary.");
    } else {
      console.log("Rejecting user is the final recipient.");
    }

    // Determine the appropriate status based on rejection context
    const newStatus = isFinalRecipient ? "REJECTED" : "INTERRUPTED";

    console.log(
      `Rejecting user is ${isFinalRecipient ? "final recipient" : "intermediary"}. Setting status: ${newStatus}`
    );

    // Update the connection status
    await db.evaluationApprovals.updateMany({
      where: {
        evaluationIds: {
          has: evaluationId, // Check if evaluationId exists in the array
        },
      },
      data: { status: newStatus },
    });

    console.log(`Connection status updated to: ${newStatus}`);

    // Update the evaluation status to reflect rejection
    await db.evaluation.update({
      where: { id: evaluationId },
      data: { status: "REJECTED" },
    });
    console.log("evalualtion table updated")
    console.log("this is rejecting user id",rejectingUser.id,"and evaluation id",evaluationId)
    await db.path.update({
      where: {
        evaluationId_intermediaryId: {
          evaluationId: evaluationId,
          intermediaryId: rejectingUser.id,
        },
      },
      data: {
        approved: "REJECTED",
      },
    });

    console.log("Evaluation status updated to REJECTED");

    return {
      success: true,
      message: `Connection status set to ${newStatus} due to rejection.`,
    };
  } catch (error) {
    console.error("Error handling rejection:", error);
    return { success: false, error: error.message };
  }
};
export const handleApproval = async (
  evaluationId: any,
  intermediaryEmail: any
) => {
  try {
    console.log(
      `Processing approval for evaluation ${evaluationId} by ${intermediaryEmail}`
    );
    

    // Input validation
    if (!evaluationId || !intermediaryEmail) {
      throw new Error("Evaluation ID and intermediary email are required.");
    }

    // Fetch the evaluation and intermediary details
    const evaluation = await db.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error("Evaluation not found.");
    }

    const intermediary = await db.user.findUnique({
      where: { email: intermediaryEmail },
    });

    if (!intermediary) {
      throw new Error("Intermediary not found.");
    }

    // Fetch the corresponding Path record
    const path = await db.path.findFirst({
      where: {
        evaluationId: evaluationId,
        intermediaryId: intermediary.id,
      },
    });
    console.log("this is path",path)

    if (!path) {
      throw new Error("Path not found for this intermediary.");
    }

    if (path.approved==='TRUE') {
      throw new Error("This intermediary has already approved.");
    }

    console.log(
      `Path found for intermediary ${intermediaryEmail}. Marking as approved.`
    );

    // Update the Path record to mark as approved
    await db.path.update({
      where: { id: path.id },
      data: { approved: "TRUE" },
    });

    console.log(`Intermediary ${intermediaryEmail} approved successfully.`);

    // Check if all intermediaries have approved
    const pendingPaths = await db.path.findMany({
      where: {
        evaluationId: evaluationId,
        approved: "FALSE",
      },
    });
    console.log("pending paths",pendingPaths)
    console.log("number of pending paths ",pendingPaths.length-1);

    if (pendingPaths.length===0) {
      // All intermediaries have approved, mark the evaluation as completed
      await db.evaluation.update({
        where: { id: evaluationId },
        data: { status: "COMPLETED" },
      });

      console.log(`Evaluation ${evaluationId} marked as COMPLETED.`);

      // Update the Connection table to mark the connection as connected
      await db.evaluationApprovals.updateMany({
        where: {
          evaluationIds: { has: evaluationId }, // Check if evaluationId exists in the array
        },
        data: {
          evaluationWorked: evaluationId, // Set the evaluationWorked field
          status: "CONNECTED", // Update status to CONNECTED
        },

      });

      const requester = await db.user.findUnique({
        where: { id: evaluation.requesterId },
      });

      const recipient = await db.user.findUnique({
        where: { id: evaluation.recipientId },
      });
       if (requester && recipient) {
          // POST to the API
          const relationshipPayload = {
            email1: requester.email,
            email2: recipient.email,
            strength: 9, // Set strength as required
          };
          console.log("inside the connection api",relationshipPayload.email1,relationshipPayload.email2)
          // const id1=await fetchUserId(relationshipPayload.email1)
          // const id2=await fetchUserId(relationshipPayload.email2)
          const id1=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${relationshipPayload.email1}`)
          const id2=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${relationshipPayload.email2}`)
          console.log("these are the ids",id2.data.data._id,id1.data.data._id)
          try {
            const response=await createUserChat(id2.data.data._id,id1.data.data._id)
            console.log("this is chat response",response.data.data)


      
          } catch (error) {
            
          }
          // const handleCreateChat = async (receiverId) => {
          //   try {
          //     console.log("this is reciever id",receiverId)
          //     const response = await createUserChat(receiverId,currentUserId);
        
          //     const newChat = response.data.data;

          //     toast.success("Chat created successfully");
          //   } catch (error) {
          //     console.error("Error creating chat:", error);
          //     toast.error("Failed to create chat");
          //   }
          // };
        }
      } else {
        console.log(
          `Evaluation ${evaluationId} still has ${pendingPaths.length} pending approvals.`
        );
      }


    console.log(`Connection for evaluation ${evaluationId} marked as CONNECTED.`);
    

    // Update the order of all paths
    const allPaths = await db.path.findMany({
      where: { evaluationId: evaluationId },
      orderBy: { order: "asc" }, // Ensure the paths are ordered
    });
 
    
    // const initiatorUser=await db.path.findFirst({
    //   where: { evaluationId: evaluationId , order : path.order},
    //   include: {
    //     intermediary: {
    //       select: {
    //         email: true, // Fetch the intermediary user's email
    //       },
    //     },
    //     evaluation: {
    //       select: {
    //         requester: {
    //           select: {
    //             email: true, // Fetch the requester's email
    //           },
    //         },
    //         recipient: {
    //           select: {
    //             email: true, // Fetch the recipient's email
    //           },
    //         },
    //       },
    //     },
    //   },

    // })
    // console.log("initiator user",initiatorUser)

    const nextPath = await db.path.findFirst({
      where: {
        evaluationId: evaluationId,
        order: path.order + 1,
      },
      include: {
        intermediary: {
          select: {
            email: true, // Fetch the intermediary user's email
          },
        },
        evaluation: {
          select: {
            requester: {
              select: {
                email: true, // Fetch the requester's email
              },
            },
            recipient: {
              select: {
                email: true, // Fetch the recipient's email
              },
            },
          },
        },
      },
    });
    if(!nextPath)  return { success: true, message: "Approval processed successfully." };
    console.log("this is next path",nextPath)
    const nextPathUserId=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${nextPath.intermediary.email}`)
    const initiatorUser=await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${nextPath?.evaluation?.requester?.email}`)
    console.log("this is current user id",initiatorUser.data)
    console.log("this is nexpath user id",nextPathUserId.data.data)
    await createUserChat(nextPathUserId.data.data._id,initiatorUser.data.data._id)
    console.log("created chat")

    let order = 0;
    for (const p of allPaths) {
      await db.path.update({
        where: { id: p.id },
        data: { new_order: p.approved==="TRUE" ? 0 : ++order },
      });
    }

    console.log(`Path orders updated for evaluation ${evaluationId}.`);

    return { success: true, message: "Approval processed successfully." };
  } catch (error) {
    console.error("Error handling approval:", error);
    return { success: false, error: error.message };
  }
};
export async function fetchRequestsForIntermediary(intermediaryEmail: string) {
  try {
    console.log("Fetching requests for", intermediaryEmail);

    // Input validation
    if (!intermediaryEmail) {
      throw new Error('Intermediary email is required and must be a string.');
    }

    const requests = await db.path.findMany({
      where: {
        intermediary: {
          email: intermediaryEmail,
        },
        new_order: 1, // Ensures the intermediary is the first in the chain
        approved: "FALSE",
      },
      include: {
        evaluation: {
          include: {
            requester: {
              select: { id: true, email: true, name: true },
            },
            recipient: {
              select: { id: true, email: true, name: true },
            },
            paths: {
              select: {
                id: true,
                new_order: true,
                intermediary: {
                  select: { email: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    console.log("Raw requests:", requests);

    // Fetch immediate next intermediary (new_order + 1) for each evaluation
    const formattedRequests = await Promise.all(
      requests.map(async (path) => {
        const nextNode = await db.path.findFirst({
          where: {
            evaluationId: path.evaluationId,
            order: path.order + 1, // Next intermediary in the sequence
          },
          select: {
            intermediary: {
              select: { email: true, name: true },
            },
          },
        });

        return {
          evaluationId: path.evaluationId,
          requester: path.evaluation.requester,
          recipient: path.evaluation.recipient,
          nextNode: nextNode ? nextNode.intermediary : null,
          status: path.evaluation.status,
          createdAt: path.createdAt,
        };
      })
    );

    console.log("Formatted Requests:", formattedRequests);
    return { success: true, data: formattedRequests };
  } catch (error) {
    console.error("Error fetching requests for intermediary:", error);
    return { success: false, error: error.message };
  }
}

export const messagesent=async(senderName:string,recipientEmail:string)=>{
  const subject = "New Message";
  const bodyText = `${senderName} has sent you a message.`;
  const bodyHtml = `
 
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Message</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.s {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.i {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.bk { padding-top:5px!important } .bj { padding-bottom:5px!important } .bi { padding-top:40px!important } .bh { padding-bottom:15px!important }  *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important }  .be p { } .bd p { } .bc p { } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left }       .g td a { font-size:14px!important } .bf p, .bf a { font-size:14px!important } .be p, .be a { font-size:14px!important } .bd p, .bd a { font-size:16px!important } .bc p, .bc a { font-size:12px!important } .z, .z h1, .z h2, .z h3, .z h4, .z h5, .z h6 { text-align:center!important }     .y .rollover:hover .rollover-second, .z .rollover:hover .rollover-second, .ba .rollover:hover .rollover-second { display:inline!important }   a.s, button.s { font-size:18px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.s, button.s, .w { display:inline-block!important }  .r, .r .s, .t, .t td, .g { display:inline-block!important }  .l table, .m table, .n table, .l, .n, .m { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important }      .g td { width:1%!important } table.f, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .img-2725 { height:151px!important } h1 a { text-align:left } h2 a { text-align:left } h3 a { text-align:left } .d .e, .d .e * { font-size:16px!important; line-height:150%!important } .a .b.c, .a .b.c * { font-size:20px!important; line-height:150%!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f6f6f6"></v:fill>
			</v:background>
		<![endif]-->
   <table cellspacing="0" cellpadding="0" width="100%" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellspacing="0" cellpadding="0" align="center" class="m" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="bf" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" role="none">
             <tr>
              <td bgcolor="#ffffff" align="left" style="padding:10px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://connect.coryfi.com" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"><img src="https://ekcpefh.stripocdn.email/content/guids/CABINET_58374735cbe51047ab668e973a968c91de21257e54d4f75892e31f0139faeacb/images/image.png" alt="" height="140" class="img-2725" width="215" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="a" style="padding:0;Margin:0"><h2 class="z c b" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#000000">New Message</h2></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="l" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="be" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" bgcolor="#ffffff" style="padding:5px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:590px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:15px;padding-right:25px;padding-bottom:10px"><h3 class="z" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#000000">${senderName}</h3></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:25px;padding-bottom:10px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#000000;font-size:14px">has sent you a message</p></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:10px;padding-right:10px;padding-bottom:15px"><span class="w" style="border-style:solid;border-color:#333333;background:#000000;border-width:0;display:inline-block;border-radius:20px;width:auto;border-left-color:#2cb543"><a href="https://connect.coryfi.com/?tab=chats&expand=true" target="_blank" class="s" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px;display:inline-block;background:#000000;border-radius:20px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #000000">See Now</a></span></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="n" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table align="center" cellpadding="0" cellspacing="0" class="bd" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none">
             <tr>
              <td align="left" bgcolor="#ffffff" class="bk bj" style="padding:20px;Margin:0;background-color:#ffffff">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bi" style="padding:0;Margin:0;padding-bottom:15px;padding-top:35px;font-size:0">
                       <table cellpadding="0" cellspacing="0" class="f t" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://x.com/CoryfiConnect" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="X" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/x-logo-black.png" alt="X" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><a target="_blank" href="https://www.linkedin.com/company/coryfi-connect/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="LinkedIn" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png" alt="In" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://www.reddit.com/r/Coryfi/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img title="Reddit" src="https://ekcpefh.stripocdn.email/content/assets/img/social-icons/logo-black/reddit-logo-black.png" alt="Reddit" width="32" height="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" class="bc bh bk" style="padding:0;Margin:0;padding-bottom:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Coryfi Connect © 2025 Coryfi Connect Pvt Ltd</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">All Rights Reserved.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#b2b1b1;font-size:12px">Contact: support@coryfi.com</p></td>
                     </tr>
                     <tr>
                      <td class="bc" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" width="100%" class="g" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links">
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://connect.coryfi.com" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Visit Us </a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1rOu9NfpS6kG3Glj4uM3sftEWwCzH5HTZ/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1m99JCl8X2eEAlQejePDemZPr4Xi-zi-g/view?usp=drive_link" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
  `;



  const result = await sendEmail(recipientEmail, subject, bodyText, bodyHtml);
  return result;

}
  
  // Simulated waitForApproval function
  // async function waitForApproval(email: string): Promise<boolean> {
  //   // Simulate asynchronous approval process
  //   console.log(`Waiting for approval from ${email}...`);
  //   return new Promise((resolve) =>
  //     setTimeout(() => resolve(Math.random() > 0.3), 2000) // 70% chance of approval
  //   );
  // }
  
  // // This function waits for approval, this needs to be implemented
  // // It's a placeholder for actual approval logic
  // const waitForApproval = async (email: string): Promise<boolean> => {
  //   // You need to implement this function to check whether the intermediary has approved the request
  //   // This can be done using an API endpoint, a UI-based process, or real-time communication via WebSockets
    
  //   // Example placeholder (can be replaced with actual logic)
  //   // In a real-world scenario, you would use an event or API call that waits for a response from the intermediary
  //   return new Promise((resolve) => {
  //     // Simulating a delay for approval (replace with real approval process)
  //     setTimeout(() => {
  //       // Here you will return `true` if approved or `false` if not approved
  //       resolve(true);  // Assuming approved for now, replace with actual logic
  //     }, 1000); // Simulate delay (for demo purposes)
  //   });
  // };
  
  // Helper function to simulate the approval process
  // const simulateApproval = async (email: string): Promise<boolean> => {
  //   // Simulate approval by an intermediary (for testing purposes)
  //   // Replace with actual logic to send notifications/emails to intermediaries
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       const approved = Math.random() > 0.2; // 80% chance of approval
  //       resolve(approved);
  //     }, 1000); // Simulate delay for approval
  //   });
  // };
  
  // Helper function to simulate the approval process
;
  // export const approveByIntermediary = async (
  //   intermediaryEmail: string,
  //   connectionId: number
  // ) => {
  //   try {
  //     const connection = await db.connection.findUnique({
  //       where: { id: connectionId },
  //     });
  
  //     if (!connection) {
  //       throw new Error("Connection request not found.");
  //     }
  
  //     if (!connection.intermediaries.includes(intermediaryEmail)) {
  //       throw new Error("You are not an intermediary for this request.");
  //     }
  
  //     if (connection.approvedBy.includes(intermediaryEmail)) {
  //       throw new Error("You have already approved this request.");
  //     }
  
  //     // Add intermediary approval
  //     const updatedConnection = await db.connection.update({
  //       where: { id: connectionId },
  //       data: {
  //         approvedBy: {
  //           push: intermediaryEmail,
  //         },
  //       },
  //     });
  
  //     // Check if all intermediaries have approved
  //     if (
  //       updatedConnection.approvedBy.length ===
  //       updatedConnection.intermediaries.length
  //     ) {
  //       await db.connection.update({
  //         where: { id: connectionId },
  //         data: { stage: "FINAL" },
  //       });
  //     }
  
  //     return { success: true, connection: updatedConnection };
  //   } catch (error) {
  //     console.error("Error approving connection request:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  // export const get_intermediary_requests = async (recipientEmail: string) => {
  //   try {
  //     // Validate input 
  //     if (!recipientEmail) {
  //       throw new Error('Recipient email is required.');
  //     }
  
  //     // Retrieve recipient ID based on email
  //     const recipient = await db.user.findUnique({
  //       where: { email: recipientEmail },
  //     });
  
  //     if (!recipient) {
  //       throw new Error('No user found with the given email.');
  //     }
  
  //     const { id: recipientId } = recipient;

  //     // Fetch connection requests with status 'INTERMEDIARY'
  //     const intermediaryRequests = await db.connection.findMany({
  //       where: {
  //         recipientId,
  //         stage: 'INTERMEDIARY', // Only fetch connections with 'INTERMEDIARY' status
  //       },
  //       include: {
  //         requester: true, // Include requester details
  //       },
  //     });
  
  //     if (intermediaryRequests.length === 0) {
  //       console.log('No intermediary requests found.');
  //     } else {
  //       console.log('Intermediary connection requests:', intermediaryRequests);
  //     }
  
  //     return { success: true, requests: intermediaryRequests };
  //   } catch (error) {
  //     console.error('Error fetching intermediary connection requests:', error);
  //     return { success: false, error: error.message };
  //   }
  // };


  // export const approveFinalConnection = async (recipientEmail, connectionId) => {
  //   try {
  //     const connection = await db.connection.findUnique({
  //       where: { id: connectionId },
  //     });
  
  //     if (!connection) {
  //       throw new Error("Connection request not found.");
  //     }
  
  //     const recipient = await db.user.findUnique({
  //       where: { id: connection.recipientId },
  //     });
  
  //     if (!recipient || recipient.email !== recipientEmail) {
  //       throw new Error("You are not the intended recipient of this request.");
  //     }
  
  //     if (connection.stage !== "FINAL") {
  //       throw new Error("The connection request is not in the final stage.");
  //     }
  
  //     const updatedConnection = await db.connection.update({
  //       where: { id: connectionId },
  //       data: {
  //         status: "APPROVED",
  //         acceptedAt: new Date(),
  //       },
  //     });
  
  //     return { success: true, connection: updatedConnection };
  //   } catch (error) {
  //     console.error("Error approving final connection:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  export const updateUserProfile=async(input)=> {
    const { userId, name, email, userDetails } = input;
    console.log("userdetials being saved",userDetails)
    try {
      // Update user profile
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          userdp:userDetails.displayImage,
          userDetails: userDetails
            ? {
                upsert: {
                  create: userDetails,
                  update: userDetails,
                },
              }
            : undefined,
        },
        include: {
          userDetails: true, // Include the updated details in the response
        },
      });
      if(name){
        const updateMongoUser=await axios.post(`https://chat.coryfi.com/api/v1/users/editUser/`,{
          email,
          name
        })
        console.log("mongo user updated",updateMongoUser)
      }
      
  
      console.log('User profile updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }