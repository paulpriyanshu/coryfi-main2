'use server'
// import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import AWS from "aws-sdk"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import db from "@/db"
import nodemailer from "nodemailer"
import { like_notification } from "./network"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
})


const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalName.substring(originalName.lastIndexOf('.'))
  return `${timestamp}-${randomString}${fileExtension}`
}

const getImageUrl = (key: string) => {
  return `https://gezeno.s3.eu-north-1.amazonaws.com/${key}`
}

export const getUnconnectedUsers = async (email: string, page: number = 1, limit: number = 5) => {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    const currentUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const users = await db.user.findMany({
      where: {
        AND: [
          { email: { not: email } },
          {
            NOT: {
              OR: [
                {
                  connectionsReceived: {
                    some: {
                      AND: [
                        { requesterId: currentUser.id },
                        { status: { in: ["APPROVED", "PENDING"] } },
                      ],
                    },
                  },
                },
                {
                  connections: {
                    some: {
                      AND: [
                        { recipientId: currentUser.id },
                        { status: { in: ["APPROVED", "PENDING"] } },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit, // Fetch only `limit` (5) at a time
      orderBy: {
        id: "asc", // You can replace with "createdAt" or random logic
      },
      select: {
        id: true,
        email: true,
        name: true,
        userdp: true,
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching unconnected users:", error);
    throw new Error("Failed to fetch unconnected users");
  }
};

export const getAllUnconnectedUsers = async (email: string) => {
  try {
    if (!email) {
      throw new Error("Email is required")
    }

    const currentUser = await db.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (!currentUser) {
      throw new Error("User not found")
    }

    // Get users who are not connected with the current user
    const users = await db.user.findMany({
      where: {
        AND: [
          { email: { not: email } },
          {
            NOT: {
              OR: [
                { 
                  connectionsReceived: {
                    some: {
                      AND: [
                        { requesterId: currentUser.id },
                        { status: "APPROVED" }
                      ]
                    }
                  }
                },
                {
                  connections: {
                    some: {
                      AND: [
                        { recipientId: currentUser.id },
                        { status: "APPROVED" }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        userdp: true
      }
    })
    
    // console.log("unconnected users", users)
    return users
  } catch (error) {
    console.error("Error fetching unconnected users:", error)
    throw new Error("Failed to fetch unconnected users")
  }
}

export const getUrl = async (filename: string) => {
  try {
    if (!filename) {
      throw new Error("Filename is required")
    }

    const uniqueFilename = generateUniqueFilename(filename)
    const key = `images/${uniqueFilename}`

    const command = new PutObjectCommand({
      Bucket: "gezeno",
      Key: key,
      ContentType: "image/jpeg" // You might want to make this dynamic based on the file type
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return { url, filename: uniqueFilename }
  } catch (error) {
    console.error("Error generating signed upload URL:", error)
    throw new Error("Failed to generate signed upload URL")
  }
}

export const getImage = async (filename: string) => {
  try {
    if (!filename) {
      throw new Error("Filename is required")
    }
    const url = getImageUrl(`images/${filename}`)
    return { url }
  } catch (error) {
    console.error("Error generating direct URL:", error)
    throw new Error("Failed to generate direct URL")
  }
}

export const fetchAllUsers=async()=>{
  const user=await db.user.findMany({
    include:{
      userDetails:true
    }
  })
  return user

}


export async function searchUsers(searchTerm: string, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    take: pageSize,
    skip: offset,
    select: {
      id: true,
      name: true,
      email: true,
   
    },
  })

  const totalCount = await db.user.count({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
  })

  const results = users.map((user) => ({
    ...user,

  }))

  return {
    results,
    nextPage: page < Math.ceil(totalCount / pageSize) ? page + 1 : undefined,
  }
}

export const fetchUserInterests = async(userEmail:string)=>{
    const user=await db.user.findFirst({
      where:{
        email:userEmail
      },
      select:{
        id:true,
        interestSubcategories:true
      }
    })
    return user
}
export const fetchUserData = async (userId: number) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      userdp: true,
      userDetails: {
        select: {
          bio: true,
          phoneNumber: true,
          addresses: {
            select: {
              id: true,
              type: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              state: true,
              country: true,
              zip: true,
              landmark: true,
              instructions: true,
            },
          },
        },
      },
      _count: {
        select: {
          connections: {
            where: { status: "APPROVED" }
          },
          connectionsReceived: {
            where: { status: "APPROVED" }
          }
        }
      }
    },
  });

  const approvedConnectionsCount =
    user._count.connections + user._count.connectionsReceived;

  return { ...user, approvedConnectionsCount };
};
export const fetchUserId=async(email:string)=>{
    const user=await db.user.findFirst({
        where:{
            email
        },
        select: {
          id: true,
          name: true,
          email: true,
          userdp: true,
          userDetails: {
            select: {
              bio: true, // Fetch bio from userDetails table
              phoneNumber:true,
              addresses:{
                select: {
                  id: true,
                  type: true,
                  addressLine1: true,
                  addressLine2: true,
                  city: true,
                  state: true,
                  country: true,
                  zip: true,
                  landmark: true,
                  instructions: true,
                },
              }
    
            },
          },
        },
        
    })
    if (!user) {
      // console.log("No user found for this email");
      return null;
  }
    // console.log("user",user)
    return user


  }

  export const fetchUserDp=async(emails:string[])=>{
    const user=await db.user.findMany({
        where:{
            email:{
              in: emails
            }
        },
        select:{
          email:true,
          userdp:true
        }
    })
    return user || null


  }

export const fetchUserInfo=async(email?:string,id?:number)=>{
  if (id) {
    const user=await db.userDetails.findUnique({
      where:{
        id
      }
    })
    return user
  } else {
    const user = await db.user.findFirst({
      where: { email },
      include: {
        userDetails: true, // Include UserDetails in the result
      },
    });
    return user
  }
  
}

export const fetchUserConnections = async (email: string) => {
  try {
    // Step 1: Find the user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user.id;

    // Step 2: Find connections where the user is either requester or recipient
    const connections = await db.connection.findMany({
      where: {
        AND: [
          {
            OR: [
              { requesterId: userId },
              { recipientId: userId },
            ],
          },
          { status: "APPROVED" }, // Ensure the connection status is "APPROVED"
        ],
      },
      include: {
        requester: true, // Include details about the requester
        recipient: true, // Include details about the recipient
      },
    });

    return connections;
  } catch (error) {
    console.error("Error fetching user connections:", error);
    throw new Error("Failed to fetch user connections");
  }
};




// Configure AWS SES
AWS.config.update({
  region: "us-east-1", // Replace with your AWS region
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });
const CHARSET = "UTF-8";
// Function to send email using AWS SES
const sendSESEmail = async (to: string, subject: string, bodyText: string,bodyHtml) => {
  try {
    const params = {
      Source:process.env.SENDER,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Data: bodyText,
            Charset: CHARSET
          },
          Html: {
            Data: bodyHtml,
            Charset: CHARSET
          }
        },
        Subject: {
          Data: subject,
        },
      },
    };

    await ses.sendEmail(params).promise();
    // console.log(`Email sent to ${to}`);
    return true
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};

const sendGmailEmail = async (
  to: string,
  subject: string,
  bodyText: string,
  bodyHtml: string
) => {
  try {
    // Configure Nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Use an App Password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: bodyText,
      html: bodyHtml,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};
export const notifyOwnersOnOrders = async (
  productIds: number[],
  orderId: string
) => {
  try {
    // 1. Fetch products with full chain: Product → BusinessPageLayout → BusinessToPageLayout → Business → Merchant → User
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        business: {
          include: {
            businessToPageLayouts: {
              include: {
                business: {
                  include: {
                    merchant: {
                      include: {
                        user: true, // ✅ we need the final owner
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (products.length === 0) {
      throw new Error("No products found for this order");
    }

    // 2. Collect unique owners (merchant → user)
    const usersMap = new Map<
      number,
      { id: number; email: string | null; name?: string | null }
    >();

    for (const product of products) {
      const layouts = product.business?.businessToPageLayouts ?? [];
      for (const btpl of layouts) {
        const user = btpl.business?.merchant?.user;
        if (user?.email) {
          usersMap.set(user.id, user);
        }
      }
    }

    const users = [...usersMap.values()];
    if (users.length === 0) {
      throw new Error("No merchant owners (with email) found for these products");
    }

    // 3. Prepare product summary for email
    const productNames = products.map((p) => p.name).join(", ");
    console.log("📦 Products in order:", productNames);

    const subject = `New Order #${orderId}`;
    const bodyText = `A new order (${orderId}) has been placed for product(s): ${productNames}.`;

    // 4. Send emails sequentially (with 500ms delay to be safe)
    const results: any[] = [];
    for (const user of users) {
      try {
        const bodyHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>New Order Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
            <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:10px;">
              <h2 style="color:#000;">Hello ${user.name || "Owner"},</h2>
              <p>A new order (<b>#${orderId}</b>) has been placed.</p>
              <p><b>Products:</b> ${productNames}</p>
              <p style="margin-top:20px;">You can log into your dashboard to see details.</p>
              <a href="https://connect.coryfi.com/orders/${orderId}" 
                 style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:5px;margin-top:20px;">
                 View Order
              </a>
              <p style="font-size:12px;color:#999;margin-top:40px;">
                Coryfi Connect © 2025 Coryfi Connect Pvt Ltd — All Rights Reserved.
              </p>
            </div>
          </body>
          </html>
        `;

        const result = await sendSESEmail(user.email, subject, bodyText, bodyHtml);
        console.log(`✅ Email sent to ${user.email}`, result);
        results.push({ status: "fulfilled", email: user.email, value: result });

        await new Promise((resolve) => setTimeout(resolve, 500)); // throttle
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
        results.push({ status: "rejected", email: user.email, reason: error });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error("notifyOwnersOnOrders error:", error);
    return { success: false, error: (error as Error).message };
  }
};


export const notifyUsersOnNewPost = async (name: string) => {
  try {
    const users = await db.user.findMany({
      select: { email: true }, // Fetch only emails
    });

    const subject = `New Post`;
    const bodyText = `${name} has added a new post `;

    // Process emails sequentially with a 1-second delay between each
    const results = [];
    for (const user of users) {
      if (user.email) {
        try {
          const bodyHtml=`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
           <head>
            <meta charset="UTF-8">
            <meta content="width=device-width, initial-scale=1" name="viewport">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="telephone=no" name="format-detection">
            <title>New Post Created</title><!--[if (mso 16)]>
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
                                <td align="center" class="a" style="padding:0;Margin:0"><h2 class="z c b" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#000000">New Post Activity</h2></td>
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
                                <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:15px;padding-right:25px;padding-bottom:10px"><h3 class="z" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#000000">${name}</h3></td>
                               </tr>
                               <tr>
                                <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:25px;padding-bottom:10px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#000000;font-size:14px">has created a new post</p></td>
                               </tr>
                               <tr>
                                <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:10px;padding-right:10px;padding-bottom:15px"><span class="w" style="border-style:solid;border-color:#333333;background:#000000;border-width:0;display:inline-block;border-radius:20px;width:auto;border-left-color:#2cb543"><a href="https://connect.coryfi.com/feed" target="_blank" class="s" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px;display:inline-block;background:#000000;border-radius:20px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #000000">See Now</a></span></td>
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
                                    <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1CcHDnfP2VRRnuQhM9m-FRGMW5TTmema2/view?usp=sharing" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1VjIZUwH1Jrgrk6Y8AssPNDjRjfr-Ab9p/view?usp=sharing" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
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
               <tr>
                  <td align="center" style="padding:20px;Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:12px;color:#999999">
                    <p>If you no longer wish to receive these emails, you can <a href="https://connect.coryfi.com/unsubscribe?email={{USER_EMAIL}}" style="color:#1376C8;text-decoration:underline;">unsubscribe here</a>.</p>
                   
                  </td>
                </tr>
             </table>
            </div>
            
           </body>
          </html>`
          

          // Send the individual email
          const result = await sendSESEmail(user.email, subject, bodyText, bodyHtml);
          results.push({ status: "fulfilled", value: result });
          
          // Wait for 1 second before sending the next email
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          results.push({ status: "rejected", reason: error });
        }
      }
    }

    // Log the results summary
    const successCount = results.filter(r => r.status === "fulfilled").length;
    // console.log(`Successfully sent ${successCount} out of ${users.length} emails`);
    
    return results;
  } catch (error) {
    console.error("Error notifying users:", error);
    throw error;
  }
};


export const onLikePost = async (likerName: string,likerEmail:string, postId: number) => {
  try {
    // console.log("likin this post",postId)
    // Find the post and include the owner's details
    const post = await db.post.findFirst({
      where: { id: postId },
      include: { user: true }, // Assuming the `post` model has a relation to the `user` model
    });
    const liker=await db.user.findUnique({
      where:{
        email:likerEmail
      }
    })

    // Check if the post and user exist
    if (!post || !post.user) {
      console.error("Post or post owner not found.");
      return;
    }
    await like_notification(likerEmail,likerName,post.userId,postId,liker.id)
    const postOwnerEmail = post.user.email; // Assuming `email` is a field in the `user` model
    const subject = "Someone Liked Your Post!";
    const bodyText = `${likerName} liked your post`;
    const bodyHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Likes</title><!--[if (mso 16)]>
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
              <td align="left" bgcolor="#ffffff" style="padding:5px;Margin:0;background-color:#ffffff">
               <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:590px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:15px;padding-right:25px;padding-bottom:10px"><h3 class="z" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#000000">${likerName}</h3></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:25px;padding-bottom:10px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#000000;font-size:14px">has liked your post</p></td>
                     </tr>
                     <tr>
                      <td align="center" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:10px;padding-right:10px;padding-bottom:15px"><span class="w" style="border-style:solid;border-color:#333333;background:#000000;border-width:0;display:inline-block;border-radius:20px;width:auto;border-left-color:#2cb543"><a href="https://connect.coryfi.com/p/${postId}" target="_blank" class="s" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px;display:inline-block;background:#000000;border-radius:20px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:21.6px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #000000">See Now</a></span></td>
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
                        <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1CcHDnfP2VRRnuQhM9m-FRGMW5TTmema2/view?usp=sharing" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" class="bc" style="Margin:0;border:0;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;border-left:1px solid #ffffff">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="https://drive.google.com/file/d/1VjIZUwH1Jrgrk6Y8AssPNDjRjfr-Ab9p/view?usp=sharing" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
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
     <tr>
                  <td align="center" style="padding:20px;Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:12px;color:#999999">
                    <p>If you no longer wish to receive these emails, you can <a href="https://connect.coryfi.com/unsubscribe?email={{USER_EMAIL}}" style="color:#1376C8;text-decoration:underline;">unsubscribe here</a>.</p>
                   
                  </td>
                </tr>
   </table>
  </div>
 </body>
</html>`;

    // Send the email using your SES email sending function
    // console.log("sending email")
    const emailResult = await sendGmailEmail(postOwnerEmail, subject, bodyText, bodyHtml);

    if (emailResult) {
      // console.log(`Email successfully sent to ${postOwnerEmail}`);
    } else {
      console.error(`Failed to send email to ${postOwnerEmail}`);
    }
  } catch (error) {
    console.error("Error sending email on post like:", error);
  }
};



  export const uploadPost = async ( userId, name, content, imageUrl) => {
    try {
      // Check if both imageUrl and videoUrl are not provided
      if (!imageUrl) {
        throw new Error('No Media provided'); 
      }
  
      // Ensure imageUrl are arrays if not null
      // const imageUrls = Array.isArray(imageUrl) ? imageUrl : [];
      // const videoUrls = Array.isArray(videoUrl) ? videoUrl : [];
  
      // Create the new post with the provided data
      // console.log(imageUrl)
      const newPost = await db.post.create({
        data: {
          userId,
          content,
          imageUrl, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      notifyUsersOnNewPost(name).catch(error => {
        console.error("Error sending notifications:", error);
      });
  
      // console.log('New Post Created:', newPost);
      return newPost;
      
    } catch (error) {
      console.error("Error uploading post:", error);
      throw error;
    }
  };
export const fetchImages = async (page: number = 1, limit: number = 4) => {
  const data = await db.post.findMany({
    skip: (page - 1) * limit, // Skip previous pages
    take: limit,              // Fetch only `limit` number of posts
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          userdp: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              userdp: true,
            },
          },
        },
      },
    },
  });

  return data;
};

export const fetchPosts = async (userId: any) => {
  const posts = await db.post.findMany({
    where: {
      userId,
    },
    select: {
      id:true,
      content: true,
      imageUrl: true,
      likes:true,
      createdAt:true,
      
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
      user:{
        select:{
          id:true,
          userdp:true,
          userDetails:true
        }
      }

    },
  });

  // Count non-null `content`, `imageUrl`, and comments
  const totalContent = posts.filter((post) => post.content !== null).length;
  const totalImageUrls = posts.filter((post) => post.imageUrl.length > 0).length;
  const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);

  return {
    posts,
    totalContent,
    totalImageUrls,
    totalComments,
  };
};

export const fetchOnlyPost = async (id: number) => {
  try {
    const data = await db.post.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        likes:true,
        createdAt: true,
        updatedAt: true,
        imageUrl:true,
        user: {
          select: {
            id: true,
            userdp: true,
            email: true,  // You can add more user fields here
            name: true,
            // Add more fields as per your requirements
          },
        },
      },
    });

    // Return null if no data is found
    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Could not fetch post data");
  }
};


export const likePost=async(id:number,viewerEmail:string)=>{
     await db.post.update({
    where: { id },
    data: {
      likes: {
        push: viewerEmail, // db's `push` adds to a `text[]` field
      },
    },
  });


}
export const dislikePost = async (id: number, viewerEmail: string) => {
  // Fetch the current likes array for the post
  const post = await db.post.findUnique({
    where: { id },
    select: { likes: true },
  });

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  // Filter out the email from the likes array
  const updatedLikes = post.likes.filter((email: string) => email !== viewerEmail);

  // Update the post with the new likes array
  await db.post.update({
    where: { id },
    data: {
      likes: updatedLikes, // Replace the old likes array with the filtered one
    },
  });
};

export const getLikesCount = async (id: number): Promise<number> => {
  const post = await db.post.findUnique({
    where: { id },
    select: { likes: true },
  });

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  return post.likes.length;
};



// Function to post a comment on a post
export async function createComment(
  postId: number, 
  userId: number, 
  content: string, 
  parentId?: number
) {
  try {
    // Ensure all necessary data is provided
    if (!postId || !userId || !content) {
      throw new Error('Post ID, user ID, and content are required.');
    }

    // Create a comment or a reply
    const comment = await db.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId: parentId || null, // Set parentId to null for top-level comments
      },
    });

    return { success: true, comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message };
  }
}

// Function to reply to a comment
export async function replyToComment(
  postId: number,
  userId: number,
  content: string,
  parentId: number
) {
  try {
    // Ensure all necessary data is provided
    if (!postId || !userId || !content || !parentId) {
      throw new Error('Post ID, user ID, content, and parent comment ID are required.');
    }

    // Create a reply to the comment
    const reply = await db.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId, // Reference the parent comment ID for this reply
      },
    });

    return { success: true, reply };
  } catch (error) {
    console.error('Error replying to comment:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchCommentsWithReplies(postId: number) {
  try {
    // Ensure postId is provided
    if (!postId) {
      throw new Error('postId is required.');
    }

    const comments = await db.comment.findMany({
      where: { postId, parentId: null }, // Only top-level comments
      include: {
        user: true, // Include user details for each comment (if needed)
        replies: {
          include: {
            user: true,
            replies: {
              include: {
                user: true,
                replies: {
                  include: {
                    user: true,
                    replies: {
                      include: {
                        user: true,
                        replies: {
                          include: {
                            user: true,
                            replies: {
                              include: {
                                user: true,
                                replies: {
                                  include: {
                                    user: true,
                                    replies: {
                                      include: {
                                        user: true,
                                        replies: {
                                          include: {
                                            user: true,
                                            replies: {
                                              include: {
                                                user: true,
                                                replies: {
                                                  include: {
                                                    user: true,
                                                    replies: {
                                                      include: {
                                                        user: true,
                                                        replies: {
                                                          include: {
                                                            user: true,
                                                            replies: {
                                                              include: {
                                                                user: true,
                                                                replies: {
                                                                  include: {
                                                                    user: true,
                                                                    replies: {
                                                                      include: {
                                                                        user: true,
                                                                        replies: {
                                                                          include: {
                                                                            user: true,
                                                                            replies: {
                                                                              include: {
                                                                                user: true,
                                                                                replies: {
                                                                                  include: {
                                                                                    user: true,
                                                                                    replies: {
                                                                                      include: {
                                                                                        user: true,
                                                                                        replies: {
                                                                                          include: {
                                                                                            user: true,
                                                                                            replies: {
                                                                                              include: {
                                                                                                user: true,
                                                                                                replies: {
                                                                                                  include: {
                                                                                                    user: true,
                                                                                                  },
                                                                                                },
                                                                                              },
                                                                                            },
                                                                                          },
                                                                                        },
                                                                                      },
                                                                                    },
                                                                                  },
                                                                                },
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Sort comments by creation time
      },
    });

    return { success: true, comments };
  } catch (error) {
    console.error('Error fetching comments with replies:', error);
    return { success: false, error: error.message };
  }
}