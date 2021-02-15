const bcrypt = require('bcryptjs')
require('dotenv').config()

require('./db')
const { User } = require('./models')
const { sendMailPromise, random } = require('./util')

const main = async () => {
    const users = await User.findAll()
    await Promise.all(users.map(async user => {
        const password = random(8).toUpperCase()
        user.password = await bcrypt.hash(password, 10)
        await user.save()
        await sendMailPromise(user.email, 'Your Credentials for IBM LMS', '', `
            <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>IBM LMS</title>
    <style type="text/css">
        p {
            margin: 10px 0;
            padding: 0;
        }

        table {
            border-collapse: collapse;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            display: block;
            margin: 0;
            padding: 0;
        }

        img,
        a img {
            border: 0;
            height: auto;
            outline: none;
            text-decoration: none;
        }

        body,
        #bodyTable,
        #bodyCell {
            height: 100%;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        .mcnPreviewText {
            display: none !important;
        }

        #outlook a {
            padding: 0;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        table {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        .ReadMsgBody {
            width: 100%;
        }

        .ExternalClass {
            width: 100%;
        }

        p,
        a,
        li,
        td,
        blockquote {
            mso-line-height-rule: exactly;
        }

        a[href^=tel],
        a[href^=sms] {
            color: inherit;
            cursor: default;
            text-decoration: none;
        }

        p,
        a,
        li,
        td,
        body,
        table,
        blockquote {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass td,
        .ExternalClass div,
        .ExternalClass span,
        .ExternalClass font {
            line-height: 100%;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        .templateContainer {
            max-width: 600px !important;
        }

        a.mcnButton {
            display: block;
        }

        .mcnImage,
        .mcnRetinaImage {
            vertical-align: bottom;
        }

        .mcnTextContent {
            word-break: break-word;
        }

        .mcnTextContent img {
            height: auto !important;
        }

        .mcnDividerBlock {
            table-layout: fixed !important;
        }

        h1 {
            color: #222222;
            font-family: Helvetica;
            font-size: 40px;
            font-style: normal;
            font-weight: bold;
            line-height: 150%;
            letter-spacing: normal;
            text-align: center;
        }

        h2 {
            color: #222222;
            font-family: Helvetica;
            font-size: 34px;
            font-style: normal;
            font-weight: bold;
            line-height: 150%;
            letter-spacing: normal;
            text-align: left;
        }

        h3 {
            color: #444444;
            font-family: Helvetica;
            font-size: 22px;
            font-style: normal;
            font-weight: bold;
            line-height: 150%;
            letter-spacing: normal;
            text-align: left;
        }

        h4 {
            color: #949494;
            font-family: Georgia;
            font-size: 20px;
            font-style: italic;
            font-weight: normal;
            line-height: 125%;
            letter-spacing: normal;
            text-align: left;
        }

        #templateHeader {
            background-color: #ffffff;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 0px;
            padding-bottom: 0px;
        }

        .headerContainer {
            background-color: transparent;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
        }

        .headerContainer .mcnTextContent,
        .headerContainer .mcnTextContent p {
            color: #757575;
            font-family: Helvetica;
            font-size: 16px;
            line-height: 150%;
            text-align: left;
        }

        .headerContainer .mcnTextContent a,
        .headerContainer .mcnTextContent p a {
            color: #007C89;
            font-weight: normal;
            text-decoration: underline;
        }

        #templateBody {
            background-color: #FFFFFF;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 40px;
            padding-bottom: 40px;
        }

        .bodyContainer {
            background-color: transparent;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
        }

        .bodyContainer .mcnTextContent,
        .bodyContainer .mcnTextContent p {
            color: #757575;
            font-family: Helvetica;
            font-size: 16px;
            line-height: 150%;
            text-align: left;
        }

        .bodyContainer .mcnTextContent a,
        .bodyContainer .mcnTextContent p a {
            color: #007C89;
            font-weight: normal;
            text-decoration: underline;
        }

        #templateFooter {
            background-color: #eef6fd;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 45px;
            padding-bottom: 63px;
        }

        .footerContainer {
            background-color: transparent;
            background-image: none;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            border-top: 0;
            border-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
        }

        .footerContainer .mcnTextContent,
        .footerContainer .mcnTextContent p {
            color: #FFFFFF;
            font-family: Helvetica;
            font-size: 12px;
            line-height: 150%;
            text-align: center;
        }

        .footerContainer .mcnTextContent a,
        .footerContainer .mcnTextContent p a {
            color: #FFFFFF;
            font-weight: normal;
            text-decoration: underline;
        }

        @media only screen and (min-width:768px) {
            .templateContainer {
                width: 600px !important;
            }
        }

        @media only screen and (max-width: 480px) {

            body,
            table,
            td,
            p,
            a,
            li,
            blockquote {
                -webkit-text-size-adjust: none !important;
            }
        }

        @media only screen and (max-width: 480px) {
            body {
                width: 100% !important;
                min-width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnRetinaImage {
                max-width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnImage {
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnCartContainer,
            .mcnCaptionTopContent,
            .mcnRecContentContainer,
            .mcnCaptionBottomContent,
            .mcnTextContentContainer,
            .mcnBoxedTextContentContainer,
            .mcnImageGroupContentContainer,
            .mcnCaptionLeftTextContentContainer,
            .mcnCaptionRightTextContentContainer,
            .mcnCaptionLeftImageContentContainer,
            .mcnCaptionRightImageContentContainer,
            .mcnImageCardLeftTextContentContainer,
            .mcnImageCardRightTextContentContainer,
            .mcnImageCardLeftImageContentContainer,
            .mcnImageCardRightImageContentContainer {
                max-width: 100% !important;
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnBoxedTextContentContainer {
                min-width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnImageGroupContent {
                padding: 9px !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnCaptionLeftContentOuter .mcnTextContent,
            .mcnCaptionRightContentOuter .mcnTextContent {
                padding-top: 9px !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnImageCardTopImageContent,
            .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,
            .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
                padding-top: 18px !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnImageCardBottomImageContent {
                padding-bottom: 9px !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnImageGroupBlockInner {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcnImageGroupBlockOuter {
                padding-top: 9px !important;
                padding-bottom: 9px !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnTextContent,
            .mcnBoxedTextContentColumn {
                padding-right: 18px !important;
                padding-left: 18px !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnImageCardLeftImageContent,
            .mcnImageCardRightImageContent {
                padding-right: 18px !important;
                padding-bottom: 0 !important;
                padding-left: 18px !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .mcpreview-image-uploader {
                display: none !important;
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            h1 {
                font-size: 30px !important;
                line-height: 125% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            h2 {
                font-size: 26px !important;
                line-height: 125% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            h3 {
                font-size: 20px !important;
                line-height: 150% !important;
            }
        }

        @media only screen and (max-width: 480px) {
            h4 {
                font-size: 18px !important;
                line-height: 150% !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .mcnBoxedTextContentContainer .mcnTextContent,
            .mcnBoxedTextContentContainer .mcnTextContent p {
                font-size: 14px !important;
                line-height: 150% !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .headerContainer .mcnTextContent,
            .headerContainer .mcnTextContent p {
                font-size: 16px !important;
                line-height: 150% !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .bodyContainer .mcnTextContent,
            .bodyContainer .mcnTextContent p {
                font-size: 16px !important;
                line-height: 150% !important;
            }
        }

        @media only screen and (max-width: 480px) {

            .footerContainer .mcnTextContent,
            .footerContainer .mcnTextContent p {
                font-size: 14px !important;
                line-height: 150% !important;
            }
        }
    </style>
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
</head>

<body style="height: 100%;margin: 0;padding: 0;width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <span class="mcnPreviewText"
        style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">Supernova
        savings with early bird pricing on summer camps</span>
    <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"
            style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;">
            <tr>
                <td align="center" valign="top" id="bodyCell"
                    style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                        style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                        <tr>
                            <td align="center" valign="top" id="templateHeader" data-template-container=""
                                style="background:#ffffff none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #ffffff;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0px;padding-bottom: 0px;">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                    class="templateContainer"
                                    style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;">
                                    <tr>
                                        <td valign="top" class="headerContainer"
                                            style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnImageBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnImageBlockOuter">
                                                    <tr>
                                                        <td valign="top"
                                                            style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                            class="mcnImageBlockInner">
                                                            <table align="left" border="0" cellpadding="0"
                                                                cellspacing="0"
                                                                style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                                width="100%" class="mcnTextContentContainer">
                                                                <tbody>
                                                                    <tr>
                                                                        <td valign="top" class="mcnTextContent"
                                                                            style="padding: 0px 18px 9px;color: #474C72;font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;font-size: 16px;line-height: 150%;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;">
                                                                            <div style="text-align: center;"><br>

                                                                                <span style="font-size:30px"><strong>
                                                                                        Welcome to IBM ICE Learning
                                                                                        Program
                                                                                    </strong></span></div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnImageBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnImageBlockOuter">
                                                    <tr>
                                                        <td valign="top"
                                                            style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                            class="mcnImageBlockInner">
                                                            <table align="left" width="100%" border="0" cellpadding="0"
                                                                cellspacing="0" class="mcnImageContentContainer"
                                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="mcnImageContent" valign="top"
                                                                            style="padding-right: 9px;padding-left: 9px;padding-top: 0;padding-bottom: 0;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <img align="center" alt=""
                                                                                src="https://pbs.twimg.com/media/DqMnM7kWoAAjYjg.jpg"
                                                                                width="564"
                                                                                style="max-width: 5000px;padding-bottom: 0px;vertical-align: bottom;display: inline !important;border-radius: 5%;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;"
                                                                                class="mcnImage">
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top" id="templateBody" data-template-container=""
                                style="background:#FFFFFF none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FFFFFF;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 40px;padding-bottom: 40px;">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                    class="templateContainer"
                                    style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;">
                                    <tr>
                                        <td valign="top" class="bodyContainer"
                                            style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnTextBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                    <tr>
                                                        <td valign="top" class="mcnTextBlockInner"
                                                            style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table align="left" border="0" cellpadding="0"
                                                                cellspacing="0"
                                                                style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                                width="100%" class="mcnTextContentContainer">
                                                                <tbody>
                                                                    <tr>
                                                                        <td valign="top" class="mcnTextContent"
                                                                            style="padding: 0px 18px 9px;color: #474C72;font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;font-size: 16px;line-height: 150%;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;">
                                                                            <div style="text-align: center;"><br>
                                                                                <span style="font-size:20px"><span
                                                                                        style="color:#474C72">
                                                                                        <font
                                                                                            face="roboto, helvetica neue, helvetica, arial, sans-serif">
                                                                                            All our course content is
                                                                                            backed by IBM, we are here
                                                                                            to deliver you content
                                                                                            created by
                                                                                            our industry experts<br>
                                                                                            <br>
                                                                                            <b> Your Email address is :-
                                                                                                <strong
                                                                                                    style="color: #a50e0e;">${user.email}</strong></b>
                                                                                    </span></span><br>
                                                                                <br>
                                                                                <span style="font-size:20px"><strong>

                                                                                        Your LMS account password is :-
                                                                                        <span style="color:#FF57D0"><b>
                                                                                                ${password} </b></span>
                                                                                    </strong></span></div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnButtonBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnButtonBlockOuter">
                                                    <tr>
                                                        <td style="padding-top: 0;padding-right: 18px;padding-bottom: 18px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                            valign="top" align="center" class="mcnButtonBlockInner">
                                                            <table border="0" cellpadding="0" cellspacing="0"
                                                                width="100%" class="mcnButtonContentContainer"
                                                                style="border-collapse: separate !important;border-radius: 50px;background-color: #5225EE;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center" valign="middle"
                                                                            class="mcnButtonContent"
                                                                            style="font-family: Arial;font-size: 18px;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <a class="mcnButton " title="Login here"
                                                                                href="http://103.89.254.154/login"
                                                                                target="_blank"
                                                                                style="font-weight: bold;letter-spacing: normal;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;display: block;">Go
                                                                                to LMS</a>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px solid #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>


                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnImageBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnImageBlockOuter">
                                                    <tr>
                                                        <td valign="top"
                                                            style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                            class="mcnImageBlockInner">
                                                            <table align="left" width="100%" border="0" cellpadding="0"
                                                                cellspacing="0" class="mcnImageContentContainer"
                                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="mcnImageContent" valign="top"
                                                                            style="padding-right: 9px;padding-left: 9px;padding-top: 0;padding-bottom: 0;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <img align="center" alt=""
                                                                                src="https://gallery.mailchimp.com/f34cfbaa8c84a87cd9053835d/images/6d91f07d-0b4a-4782-84e9-e42dec29e109.png"
                                                                                width="230"
                                                                                style="max-width: 460px;padding-bottom: 0;display: inline !important;vertical-align: bottom;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;"
                                                                                class="mcnRetinaImage">
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnTextBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                    <tr>
                                                        <td valign="top" class="mcnTextBlockInner"
                                                            style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table align="left" border="0" cellpadding="0"
                                                                cellspacing="0"
                                                                style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                                width="100%" class="mcnTextContentContainer">
                                                                <tbody>
                                                                    <tr>
                                                                        <td valign="top" class="mcnTextContent"
                                                                            style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnDividerBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                                                <tbody class="mcnDividerBlockOuter">
                                                    <tr>
                                                        <td class="mcnDividerBlockInner"
                                                            style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table class="mcnDividerContent" border="0" cellpadding="0"
                                                                cellspacing="0" width="100%"
                                                                style="min-width: 100%;border-top: 2px none #EAEAEA;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <span></span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top" id="templateFooter" data-template-container=""
                                style="background:#eef6fd none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #eef6fd;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 45px;padding-bottom: 63px;">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                    class="templateContainer"
                                    style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;">
                                    <tr>
                                        <td valign="top" class="footerContainer"
                                            style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnFollowBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnFollowBlockOuter">
                                                    <tr>
                                                        <td align="center" valign="top"
                                                            style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                            class="mcnFollowBlockInner">
                                                            <table border="0" cellpadding="0" cellspacing="0"
                                                                width="100%" class="mcnFollowContentContainer"
                                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center"
                                                                            style="padding-left: 9px;padding-right: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <table border="0" cellpadding="0"
                                                                                cellspacing="0" width="100%"
                                                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                                                class="mcnFollowContent">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td align="center" valign="top"
                                                                                            style="padding-top: 9px;padding-right: 9px;padding-left: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                                            <table align="center"
                                                                                                border="0"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td align="center"
                                                                                                            valign="top"
                                                                                                            style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                class="mcnTextBlock"
                                                style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                    <tr>
                                                        <td valign="top" class="mcnTextBlockInner"
                                                            style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                            <table align="left" border="0" cellpadding="0"
                                                                cellspacing="0"
                                                                style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"
                                                                width="100%" class="mcnTextContentContainer">
                                                                <tbody>
                                                                    <tr>
                                                                        <td valign="top" class="mcnTextContent"
                                                                            style="padding: 0px 18px 9px;color: #474C72;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;font-family: Helvetica;font-size: 12px;line-height: 150%;text-align: center;">
                                                                            <em>Copyright © 2020 Amigos, Inc., All
                                                                                rights reserved.</em><br>
                                                                            You are receiving this email because you
                                                                            opted in at our website.<br>
                                                                            <br>
                                                                            <strong>Our mailing address is:</strong><br>
                                                                            <div class="vcard"><span
                                                                                    class="org fn">Amigos,
                                                                                    Inc.</span>
                                                                                <div class="adr">
                                                                                    <div class="street-address">I3 lab,
                                                                                        Techno India NJR Institute of
                                                                                        Iechnology</div>
                                                                                    <div class="extended-address">RIICO
                                                                                        Industrial Area, Kaldwas</div>
                                                                                    <span
                                                                                        class="locality">Udaipur</span>,
                                                                                    <span
                                                                                        class="postal-code">313015</span>
                                                                                    <br>
                                                                                    <br>

                                                                                    <br>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>

</html>
        `)
    }))
}

main()
    .then(() => {
        console.log('Finished...')
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })