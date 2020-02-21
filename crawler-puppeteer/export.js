const {Workbook} = require('exceljs');
const data = require('../data.json');
const TYPE = 'kakaopf';

const options = {
  headers: {
    default: [],
    kakaopf: [
      {
        header: '발행일',
        key: 'published_at',
        width: 11,
      },
      {
        header: '제목',
        key: 'title',
        width: 50,
      },
      {
        header: '포스트\n조회수',
        key: 'view_count',
        width: 10,
      },
      {
        header: '좋아요',
        key: 'like_count',
        width: 10,
      },
      {
        header: '공유',
        key: 'share_count',
        width: 10,
      },
      {
        header: '댓글',
        key: 'comment_count',
        width: 10,
      },
      {
        header: '비디오\n조회수',
        key: 'video_play_count',
        width: 10,
      },
    ],
  },
}

function getLongestKeys(arr) {
  const longestObj = arr.reduce((all, curr) => Object.keys(all).length > Object.keys(curr).length ? all : curr);
  return Object.keys(longestObj);
}

const keysWithExtraData = getLongestKeys(data);

function updateHeaders(type, options) {
  switch (type) {
    case 'kakaopf':
      const translateHeader = {
        view: '조회',
        click: '클릭',
      }
      for (let key of keysWithExtraData) {
        if (key.slice(0, 4) === 'card') {
          const type = key.split('_')[1];
          options['headers']['kakaopf'].push({
            header: `카드뷰\n${key[4]} ${translateHeader[type]}`,
            key,
            width: 10,
          })
        }
      }
      return options['headers']['kakaopf'];
    default:
      return options['headers']['default'];
  }
}

const headers = updateHeaders(TYPE, options);
// console.log(headers);

async function exportToExcel(type, headers, data, filename, sheetname = 'Result') {
  const wb = new Workbook();
  const ws = wb.addWorksheet(sheetname, {
    properties: {
      defaultRowHeight: 20,
    },
    views: [{showGridLines: false}],
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
    color: {argb: 'FF011C27'},
  };

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {argb: 'FF011C27'},
  };

  const headerFont = {
    family: 2,
    bold: true,
    color: {argb: 'FFFFFFFF'},
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
  ws.eachRow({includeEmpty: true}, (row, rowNumber) => {
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
        console.log(cell.value)
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
  await exportToExcel(TYPE, headers, data, 'result.xlsx');
})();
