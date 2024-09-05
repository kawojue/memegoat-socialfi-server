import {
  Res,
  Req,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { RefDTO } from './dto/ref.dto';
import { AppService } from './app.service';
import { ChartDTO } from './dto/chart.dto';
import { SmartKeyDTO } from './dto/key.dto';
import { Request, Response } from 'express';
import { BalanceDTO } from './dto/balance.dto';
import { MailService } from 'lib/mail.service';
import { StatusCodes } from 'enums/statusCodes';
import { WaitListDTO } from './dto/waitlist.dto';
import { PlunkService } from 'lib/plunk.service';
import { TokenMintDTO } from './dto/token-mint.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ResponseService } from 'lib/response.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CookieAuthGuard } from './jwt/cookie-auth.guard';
import { CampaignRequestDTO } from './dto/compaign-req.dto';
import { LockerDTO } from './dto/locker.dto';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(
    private readonly mail: MailService,
    private readonly plunk: PlunkService,
    private readonly prisma: PrismaService,
    private readonly appService: AppService,
    private readonly response: ResponseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    await this.appService.leaderboard(res);
  }

  @Get('/dashboard')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    await this.appService.dashboard(res, req);
  }

  @Post('/verify/smartKey')
  async verifySmartKey(@Res() res: Response, @Body() body: SmartKeyDTO) {
    await this.appService.verifySmartKey(res, body);
  }

  @Post('/verify/referral')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async verifyRef(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RefDTO,
  ) {
    await this.appService.verifyRef(req, res, body);
  }

  @Get('/tasks')
  async fetchTasks(@Res() res: Response) {
    await this.appService.fetchTasks(res);
  }

  @Post('/campaign-request')
  async addCampaignRequest(
    @Res() res: Response,
    @Body() body: CampaignRequestDTO,
  ) {
    await this.appService.addCampaignRequest(res, body);
  }

  @Get('/campaign-requests')
  async fetchCampaignRequests(@Res() res: Response) {
    await this.appService.fetchCampaignRequests(res);
  }

  @Get('/campaign-requests/:token_addr')
  async fetchCampaignRequest(
    @Res() res: Response,
    @Param('token_addr') token_addr: string,
  ) {
    await this.appService.fetchCampaignRequest(res, token_addr);
  }

  @Post('/minted-tokens')
  async addTokenMint(@Res() res: Response, @Body() body: TokenMintDTO) {
    await this.appService.addTokenMint(res, body);
  }

  @Get('/minted-tokens')
  async fetchMintedTokens(@Res() res: Response) {
    await this.appService.fetchMintedTokens(res);
  }

  @Get('/minted-tokens/token/:token_addr')
  async fetchMintedToken(
    @Res() res: Response,
    @Param('token_addr') token_addr: string,
  ) {
    await this.appService.fetchMintedToken(res, token_addr);
  }

  @Get('/minted-tokens/user/:user_addr')
  async fetchMintedUserToken(
    @Res() res: Response,
    @Param('user_addr') user_addr: string,
  ) {
    await this.appService.fetchUserMintedTokens(res, user_addr);
  }

  @Post('waitlist')
  async waitlist(@Res() res: Response, @Body() body: WaitListDTO) {
    await this.appService.waitlist(res, body);
  }

  @Get('/memegoatVolume')
  async getMemegoatVol(@Res() res: Response) {
    await this.appService.getMemegoatVolumeRes(res);
  }

  @Get('/tvl')
  async getTVL(@Res() res: Response) {
    await this.appService.getTVLRes(res);
  }
  @Get('/memegoatVolumeUSD')
  async getMemegoatVolUSD(@Res() res: Response) {
    await this.appService.getMemegoatVolUSDValue(res);
  }

  @Get('/tvlUSD')
  async getTVLUSD(@Res() res: Response) {
    await this.appService.getTVLUSDValue(res);
  }

  // @Post('/memegoatVolumeUSD')
  // async updateMemegoatVolUSD(@Res() res: Response, @Body() body: token[]) {
  //   await this.appService.updateMemegoatVolUSDValue(body);
  //   this.response.sendSuccess(res, StatusCodes.OK, { data: 'ok' });
  // }

  // @Post('/tvlUSD')
  // async updateTVLUSD(@Res() res: Response) {
  //   await this.appService.updateTVLUsdValue(res);
  // }

  @Post('/updatePoolsVolume')
  async updateCommunityPoolsVol(@Res() res: Response) {
    const record = await this.appService.updateCommunityPoolsVolume();
    this.response.sendSuccess(res, StatusCodes.OK, { data: record });
  }

  @Post('/updateLockerVolume')
  async updateLockerVol(@Res() res: Response) {
    const record = await this.appService.updateTokenLockerVolume();
    this.response.sendSuccess(res, StatusCodes.OK, { data: record });
  }

  @Post('/updateDexVolume')
  async updateTxnVolume(@Res() res: Response) {
    const record = await this.appService.updateDexVolume();
    this.response.sendSuccess(res, StatusCodes.OK, { data: record });
  }

  @Post('/updateLaunchpadVolume')
  async updateLaunchpadVol(@Res() res: Response) {
    const record = await this.appService.updateLaunchpadVolume();
    this.response.sendSuccess(res, StatusCodes.OK, { data: record });
  }

  @Post('/updateOTCVolume')
  async updateOTCVolume(@Res() res: Response) {
    await this.appService.updateOTCVolume(res);
  }

  @Get('/allTokens')
  async fetchAllTokens(@Res() res: Response) {
    await this.appService.getAllTokens(res);
  }

  @Get('/velarTokens')
  async fetchVelarTokens(@Res() res: Response) {
    await this.appService.getVelarTokens(res);
  }

  @Get('/alexTokens')
  async fetchAlexTokens(@Res() res: Response) {
    await this.appService.getAlexTokens(res);
  }

  @Get('/alexPools')
  async fetchAlexPools(@Res() res: Response) {
    await this.appService.getAlexPools(res);
  }

  @Get('/stxChart')
  async fetchChart(@Res() res: Response) {
    await this.appService.getSTXChart(res);
  }

  @Post('/lockerToken')
  async recordTOken(@Res() res: Response, @Body() body: LockerDTO) {
    await this.appService.recordToken(res, body);
  }

  @Get('/lockerToken')
  async getLockerTokens(@Res() res: Response) {
    await this.appService.getLockerToken(res);
  }

  @Get('/chart')
  async fetchChartOld(@Res() res: Response, @Query() body: ChartDTO) {
    await this.appService.getChartDataOld(res, body);
  }

  @Get('/chartV2')
  async fetchChartV2(@Res() res: Response, @Query() body: ChartDTO) {
    await this.appService.getChartDataV2(res, body);
  }

  @Get('/balance')
  async fetchBalance(@Res() res: Response, @Query() body: BalanceDTO) {
    await this.appService.getBalances(res, body);
  }

  @Post('send-email')
  async sendEmail(@Res() res: Response) {
    const body = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <title></title>
  
    <style type="text/css">
      @media only screen and (min-width: 520px) {
  .u-row {
    width: 500px !important;
  }
  .u-row .u-col {
    vertical-align: top;
  }

  .u-row .u-col-100 {
    width: 500px !important;
  }

}

@media (max-width: 520px) {
  .u-row-container {
    max-width: 100% !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
  .u-row .u-col {
    min-width: 320px !important;
    max-width: 100% !important;
    display: block !important;
  }
  .u-row {
    width: 100% !important;
  }
  .u-col {
    width: 100% !important;
  }
  .u-col > div {
    margin: 0 auto;
  }
}
body {
  margin: 0;
  padding: 0;
}

table,
tr,
td {
  vertical-align: top;
  border-collapse: collapse;
}

p {
  margin: 0;
}

.ie-container table,
.mso-container table {
  table-layout: fixed;
}

* {
  line-height: inherit;
}

a[x-apple-data-detectors='true'] {
  color: inherit !important;
  text-decoration: none !important;
}

table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; }
    </style>
  
  

<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #F7F8F9;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #F7F8F9;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #F7F8F9;"><![endif]-->
    
  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="https://res.cloudinary.com/kawojue/image/upload/v1724544014/memegoat/jqdeym3kwipeasqvaj6f.jpg" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 480px;" width="480"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div style="font-family: 'Rubik',sans-serif; font-size: 14px; font-weight: 700; line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="line-height: 140%;"><em>GM MemeGoat Gamers</em></p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div style="font-family: 'Rubik',sans-serif; font-size: 14px; font-weight: 700; line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="line-height: 140%;"><span style="line-height: 19.6px;">We appreciate you for your patience as we build the next gen wave of <a rel="noopener" href="https://games.memegoat.io/" target="_blank">play to earn games</a> 🎮,  on the leading bitcoin L2 stacks.</span></p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
  <div style="font-family: 'Rubik',sans-serif; font-size: 14px; font-weight: 400; line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="line-height: 140%;">It is time to unleash a new wave of possibility and a whole new era where your time, skills and luck are rewarded.</p>
<p style="line-height: 140%;"> </p>
<p style="line-height: 140%;">The official flood gates for the <a rel="noopener" href="https://games.memegoat.io/" target="_blank">MemeGoat Nakamoto Games</a> Beta Testing open at exact Monday 26th may 12pm UTC.</p>
<p style="line-height: 140%;"> </p>
<p style="line-height: 140%;">The public beta testing will go on for a week to enables users stress test the games before official tournaments kicks in.</p>
<p style="line-height: 140%;"> </p>
<p style="line-height: 140%;">To give your suggestion and feed back from testing, Join the MemeGoat community  <a rel="noopener" href="https://discord.com/invite/HMuZdJE6Er" target="_blank">discord </a>server and follow us on <a rel="noopener" href="https://x.com/GoatCoinSTX" target="_blank">x</a>.</p>
<p style="line-height: 140%;"> </p>
<p style="line-height: 140%;">Get ready to be part of a deciding moment for games on Bitcoin.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
<div align="center">
  <div style="display: table; max-width:73px;">
  <!--[if (mso)|(IE)]><table width="73" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:73px;"><tr><![endif]-->
  
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 5px;" valign="top"><![endif]-->
    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 5px">
      <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://discord.com/invite/HMuZdJE6Er" title="Discord" target="_blank">
          <img src="https://res.cloudinary.com/kawojue/image/upload/v1724544014/memegoat/fkvrq7ykicjhwdge2jhh.png" alt="Discord" title="Discord" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
      <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://x.com/GoatCoinSTX" title="X" target="_blank">
          <img src="https://res.cloudinary.com/kawojue/image/upload/v1724544013/memegoat/uu81u0pcba3eezufh04a.png" alt="X" title="X" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
    </td>
  </tr>
  </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>
`;

    const waitList = await this.prisma.waitList.findMany();

    const emails = waitList.map((w) => w.email);

    const sendEmailsInBatches = async (emails: string[], batchSize: number) => {
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        await this.mail.sendZeptoEmail({
          subject: 'Memegoat Nakamoto Begins',
          html: body,
          to: batch,
          from: 'info@memegoat.io',
        });
      }
    };

    await sendEmailsInBatches(emails, 5);

    this.response.sendSuccess(res, StatusCodes.OK, { message: 'Successful' });
  }
}
