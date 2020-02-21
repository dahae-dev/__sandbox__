const {Workbook} = require('exceljs');
const data = require('../data.json');

function longestKeyObj(arr) {
  return arr.reduce((all, current) => {
    return Object.keys(all).length > Object.keys(current).length ? all : current;
  });
}

const postWithCardView = longestKeyObj(data);

const translateHeader = {
  published_at: {
    header: '발행일',
    width: 10,
  },
  title: {
    header: '제목',
    width: 48,
  },
  view_count: {
    header: '포스트\n조회수',
    width: 10,
  },
  like_count: {
    header: '좋아요',
    width: 10,
  },
  share_count: {
    header: '공유',
    width: 10,
  },
  comment_count: {
    header: '댓글',
    width: 10,
  },
  video_play_count: {
    header: '비디오\n조회수',
    width: 10,
  },
  view: {
    header: '조회',
  },
  click: {
    header: '클릭',
  },
}

function createHeaders(obj) {
  let headers = [];
  for (let key in obj) {
    if (key !== 'id' && key.slice(0, 4) !== 'card') {
      headers = headers.concat({
        header: translateHeader[key]['header'],
        key,
        width: translateHeader[key]['width'],
      });
    }

    if (key.slice(0, 4) === 'card') {
      const type = key.split('_')[1];
      headers = headers.concat({
        header: `카드뷰\n${key[4]} ${translateHeader[type]['header']}`,
        key,
        width: 10,
      })
    }
  }
  return headers;
}

const headers = createHeaders(postWithCardView);
// console.log(headers);

async function exportToExcel(headers, data, filename, sheetname = 'Result') {
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
      row.height = 36;
      row.eachCell((cell) => {
        cell.border = drawOuterBorder(border);
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = alignment;
      });
      // rest of rows
    } else {
      row.eachCell((cell) => {
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
  await exportToExcel(headers, data, 'result.xlsx');
})();
