import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    this.auth();
  }

  private auth() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    this.sheets = sheets;
  }

  /**
   * Find list of rows in a specific range
   * @param spreadSheetId
   * @param sheetName
   * @param range
   * @returns list of rows
   */
  async findAll(
    spreadSheetId: string,
    sheetName: string,
    range: string,
  ): Promise<string[][]> {
    try {
      if (!sheetName)
        throw new HttpException(
          'sheetName is required',
          HttpStatus.BAD_REQUEST,
        );
      if (!range)
        throw new HttpException('range is required', HttpStatus.BAD_REQUEST);

      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadSheetId,
        range: `${sheetName}!${range}`,
      });

      if (result?.data?.values.length === 0) {
        throw new HttpException(
          'NOT FOUND DATA IN THAT RANGE',
          HttpStatus.NOT_FOUND,
        );
      }

      return result.data.values;
    } catch (e) {
      console.log({ error: e.message });
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Filter row by column and value.
   * NOTE: spreadsheets cannot contain more than 1000 rows
   * @param spreadSheetId
   * @param sheetName
   * @param range
   * @param column
   * @param valueToSearch
   * @returns list of rows
   */
  async filter(
    spreadSheetId: string,
    sheetName: string,
    range: string,
    column: number,
    valueToSearch: string,
  ): Promise<string[][]> {
    try {
      const rows = await this.findAll(spreadSheetId, sheetName, range);

      const filteredData: string[][] = rows.filter(
        (row) =>
          row[column - 1]?.trim()?.toLowerCase() ===
          valueToSearch?.trim().toLowerCase(),
      );

      if (filteredData.length === 0)
        throw new HttpException('ROWS NOT FOUND', HttpStatus.NOT_FOUND);

      filteredData.unshift(rows[0]);

      return filteredData;
    } catch (e) {
      console.log({ error: e.message });
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Append a Row at the end of the Sheet
   * Note: range not matter
   * @param spreadSheetId
   * @param sheetName
   * @param range
   * @param fields
   * @returns message and range
   */
  async append(
    spreadSheetId: string,
    sheetName: string,
    range: string,
    fields: unknown[],
  ): Promise<{ updatedRange: string }> {
    try {
      const result = await this.sheets.spreadsheets.values.append({
        spreadsheetId: spreadSheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED', // or RAW
        requestBody: {
          values: [fields],
        },
      });

      const updatedRange = result?.data?.updates?.updatedRange;

      return { updatedRange };
    } catch (e) {
      console.log({ error: e.message });
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update a field Row in a specific range
   * Note: range is very important
   * @param sheetId
   * @param sheetName
   * @param range
   * @param fields
   * @returns message and range
   */
  async update(
    spreadSheetId: string,
    sheetName: string,
    range: string,
    fields: unknown[],
  ): Promise<{ updatedRange: string }> {
    try {
      const result = await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadSheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [fields],
        },
      });

      if (!result.data) {
        throw new HttpException(
          'NOT FOUND DATA IN THAT RANGE',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedRange = result?.data?.updatedRange;

      return { updatedRange };
    } catch (e) {
      console.log({ error: e.message });
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete a specific Row
   * @param spreadSheetId
   * @param sheetName
   * @param rowNumber
   * @returns message
   */
  async delete(
    spreadSheetId: string,
    sheetName: string,
    rowNumber: number,
  ): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadSheetId,
        includeGridData: false,
      });
      const sheetList = response.data.sheets;
      const sheetFound = sheetList.find(
        (sheet) => sheet.properties.title === sheetName,
      );
      if (!sheetFound)
        throw new HttpException('SHEET NOT FOUND', HttpStatus.NOT_FOUND);
      const sheetId = sheetFound.properties.sheetId;

      const request = {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadSheetId,
        requestBody: {
          requests: [request],
        },
      });
    } catch (e) {
      console.log({ error: e.message });
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Converts the list of rows returned by google sheet to
   * a list of objects, where the keys of the objects
   * will be the first row (important)
   * @param rows - rows list returned by google sheet
   * @returns Object list
   */
  mapRowsToObjectList(rows: string[][]): object[] {
    const [keys, ...values] = rows;
    return values.map((valuesArr) => {
      return valuesArr.reduce((obj, value, index) => {
        obj[keys[index]] = value;
        return obj;
      }, {});
    });
  }

  /**
   * Converts an Objet to a Google Sheet Row
   * @param object - any object
   * @returns Row
   */
  mapObjectToRow(object: object): string[] {
    return Object.values(object);
  }
}
