const {
  Workbook,
} = require('exceljs');
const data = require('../../posts.json');
const TYPE = 'facebook';

const options = {
  headers: {
    default: [],
    facebook: [{
        header: '게시날짜',
        key: 'timestamp',
        width: 30,
      },
      {
        header: '게시물 텍스트',
        key: 'content',
        width: 50,
      },
      {
        header: '게시물 URL',
        key: 'url',
        width: 50,
      },
      {
        header: '좋아요',
        key: 'likes',
        width: 10,
      },
    ],
  },
}

const headers = options['headers']['facebook'];
// console.log(headers);

async function exportToExcel(type, headers, data, filename, sheetname = 'Result') {
  const wb = new Workbook();
  const ws = wb.addWorksheet(sheetname, {
    properties: {
      defaultRowHeight: 20,
    },
    views: [{
      showGridLines: false,
    }],
  });

  ws.columns = headers;
  ws.addRows(data);

  const drawOuterBorder = (border = {}, override = {}) => ({
    top: border,
    right: border,
    bottom: border,
    left: border,
    ...override,
  });

  const border = {
    style: 'thin',
    color: {
      argb: 'FF011C27',
    },
  };

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: 'FF011C27',
    },
  };

  const headerFont = {
    family: 2,
    bold: true,
    color: {
      argb: 'FFFFFFFF',
    },
  };

  const bodyFont = {
    family: 2,
  };

  const alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };

  /* eslint-disable no-param-reassign */
  ws.eachRow({
    includeEmpty: true,
  }, (row, rowNumber) => {
    // if `rowNumber` is 1, it's header
    if (rowNumber === 1) {
      row.height = type === 'kakaopf' ? 36 : 22; // TODO
      row.eachCell((cell) => {
        cell.border = drawOuterBorder(border);
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = alignment;
      });
      // rest of rows
    } else {
      row.eachCell((cell) => {
        // console.log(cell.value)
        cell.border = drawOuterBorder(border);
        cell.font = bodyFont;
        cell.alignment = alignment;
      });
    }
  });
  /* eslint-enable */

  await wb.xlsx.writeFile(filename);
}

(async () => {
  console.log('export!');
  await exportToExcel(TYPE, headers, data, 'facebook-result.xlsx');
})();
