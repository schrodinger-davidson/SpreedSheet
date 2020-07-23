const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const {ipcRenderer}=require('electron');

$(document).ready(function () {
    let cut,copy,paste;
    let db, lastClickedCell;
    $("#grid .cell").on("click", function () {
        let rowId = Number($(this).attr("ri")) + 1;
        let colId = Number($(this).attr("ci")) + 65;
        let address = String.fromCharCode(colId) + rowId;
        //    val to set value of an input
        $("#address-container").val(address);
    })

    $('#exit').on('click',function(){
        ipcRenderer.send('close-me')
    });

    $('.cell').on('keyup', function () {

        let height = $(this).height();
        let rowId = $(this).attr('ri');
        let lcArr = $("#left-col .cell");
        let myCol = lcArr[rowId];
        $(myCol).css('height', height);
        let width = $(this).width();
        let colId = $(this).attr('ci');
        let trArr = $("#top-row .cell");
        let myrow = trArr[colId];
        $(myrow).css('width', width);
    })


    $("#grid-container").on("scroll", function () {
        let vS = $(this).scrollTop();
        let hS = $(this).scrollLeft();
        // console.log(vS + " " + hS);
        $("#top-left-cell,#top-row").css("top", vS);
        $("#top-left-cell,#left-col").css("left", hS);

    })
    // *************************************New,Open,Save****************************************
    // Create 
    $("#New").on("click", function () {
        // Create a 2d array representing grid
        db = [];
        let rows = $("#grid .row");
        for (let i = 0; i < rows.length; i++) {
            let row = []
            let rowkeCells = $(rows[i]).find(".cell");
            for (let j = 0; j < rowkeCells.length; j++) {
                // Open and save
                // Grid clear
                $(rowkeCells[j]).html("");
                let cell = {
                    value: "",
                    formula: "",
                    children: [],
                    fontSize: 14,
                    fontStyle: "Noto Sans",
                    bold: false,
                    italic: false,
                    underline: false,
                    color: "black",
                    bgcolor:"white",
                    halign: "center"
                };
                row.push(cell);
            }
            db.push(row);
        }
        // clear whole grid
        console.log(db);
    })

    // Save
    $("#Save").on("click", async function () {
        // Open Dialog Box to save 
        // write your db into it
        let sdb = await dialog.showOpenDialog();
        let data = JSON.stringify(db);
        fs.writeFileSync(sdb.filePaths[0], data);
        console.log("File saved to db");
    })
    // Open
    $("#Open").on("click", async function () {
        // open Dialog Box accept input
        let sdb = await dialog.showOpenDialog();
        // Read File
        let bufferData = fs.readFileSync(sdb.filePaths[0]);
        db = JSON.parse(bufferData);
        //  Set Ui
        let rows = $("#grid .row");
        for (let i = 0; i < rows.length; i++) {
            let rowkeCells = $(rows[i]).find(".cell");
            for (let j = 0; j < rowkeCells.length; j++) {
                // Open and save
                // Grid clear
                $(rowkeCells[j]).html(db[i][j].value);
            }
        }
        console.log("File Opened");
        // Write onto grid
    })
    // ****************************Formating *******************************************

    $("#font").on("change", function () {
        let valu = $(this).val();
        console.log(valu);
        let cell = $(".cell.selected");
        cell.css("font-family", valu);
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].fontStyle = valu;
    })

    $("#fontSize").on("change", function () {
        let val = Number($(this).val());
        console.log(val);
        let cell = $(".cell.selected");
        cell.css("fontSize", val);
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].fontSize = val;
    })

    $("#bold").on("click", function () {
        $(this).toggleClass("hasOn");

        let isBold = $(this).hasClass("hasOn");
        let cell = $(".cell.selected");
        if (isBold) {
            $(cell).css("font-weight", "bold");
        } else {
            $(cell).css("font-weight", "normal");
        }
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].bold = isBold;

    })
    $("#italic").on("click", function () {
        $(this).toggleClass("hasOn");
        let isItalic = $(this).hasClass("hasOn");
        let cell = $(".cell.selected");
        if (isItalic) {
            $(cell).css("font-style", "italic");
        } else {
            $(cell).css("font-style", "normal");
        }
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].italic = isItalic;
    })

    $("#underline").on("click", function () {
        $(this).toggleClass("hasOn");

        let isUnderline = $(this).hasClass("hasOn");
        let cell = $(".cell.selected");
        if (isUnderline) {
            $(cell).css("text-decoration", "underline");
        } else {
            $(cell).css("text-decoration", "none");
        }
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].underline = isUnderline;

    })
    $("#color").on("change", function () {
        let val = $(this).val();
        console.log(val);
        let cell = $(".cell.selected");
        cell.css("color", val);
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].color = val;
    })
    
    $("#bgcolor").on("change", function () {
        let val = $(this).val();
        console.log(val);
        let cell = $(".cell.selected");
        cell.css("background-color", val);
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].color = val;
    })

    $(".halign").on("click", function () {
        let halign = $(this).attr('id');
        console.log("attr"+halign);
        let cell = $(".cell.selected");
        cell.css("text-align", halign);
        let {
            rowId,
            colId
        } = getRC(cell);
        db[rowId][colId].halign = halign;
    })
    


    // ****************************Formula*******************************************
    // Update
    // value=> value
    // formula=> value
    $("#grid .cell").on("blur", function () {
        lastClickedCell = this;
        let {
            rowId,
            colId
        } = getRC(this);
        let val = $(this).html();
        console.log(db);
        let cellObject = db[rowId][colId];
        // No change
        if (cellObject.value == $(this).html()) {
            console.log("Nothing Changed")
            return;
        }
        // formula=> fromula remove
        if (cellObject.formula) {
            removeFormula(cellObject.formula, rowId, colId);
            cellObject.formula = "";
        }
        updateCell(cellObject, rowId, colId, val);
    })
    // formula => formula
    // value=> formula
    $("#formula-container").on("blur", function () {
        // get formula
        let formula = $(this).val();
        // set  formula property of the cell
        let cellElemAdd = $("#address-container").val();

        let {
            colId,
            rowId
        } = getRcfromAdd(cellElemAdd);
        let cellObject = db[rowId][colId];
        if (cellObject.formula == $(this).val()) {
            return;
        }
        if (cellObject.formula) {
            removeFormula(cellObject.formula, rowId, colId);
            cellObject.formula = "";
        }
        cellObject.formula = formula;
        //  evaluate the formula
        let rVal = evaluate(formula);
        // update the cell's  ui
        setupFormula(formula, rowId, colId);
        updateCell(cellObject, rowId, colId, rVal);
    })

    function evaluate(formula) {
        // ( A1 + A2 )
        let formulaComponents = formula.split(" ");
        // [(,A1,+,A2,)]
        console.log(formula)
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let {
                    rowId,
                    colId
                } = getRcfromAdd(formulaComponents[i]);
                let pValue = db[rowId][colId].value;
                formula = formula.replace(formulaComponents[i], pValue);
            }
        }
        console.log(formula);
        // ( 10 + 20 )
        let rVal = eval(formula);
        console.log(rVal);
        return rVal;
    }

    function updateCell(cellObject, rowId, colId, rVal) {
        // 
        cellObject.value = rVal;
        // change on ui also
        $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html(rVal);

        for (let i = 0; i < cellObject.children.length; i++) {
            let chObjRC = cellObject.children[i];
            let fChObj = db[chObjRC.rowId][chObjRC.colId];
            let rVal = evaluate(fChObj.formula);
            updateCell(fChObj, chObjRC.rowId, chObjRC.colId, rVal);
        }
    }

    function setupFormula(formula, chrowId, chcolId) {
        // ( A1 + A2 )
        let formulaComponents = formula.split(" ");
        // [(,A1,+,A2,)]
        console.log(formula);
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let {
                    rowId,
                    colId
                } = getRcfromAdd(formulaComponents[i]);
                let parentObj = db[rowId][colId];

                parentObj.children.push({
                    rowId: chrowId,
                    colId: chcolId
                })

            }
        }
    }

    function removeFormula(formula, chrowId, chcolId) {
        // ( A1 + A2 )
        let formulaComponents = formula.split(" ");
        // [(,A1,+,A2,)]
        console.log(formula);
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let {
                    rowId,
                    colId
                } = getRcfromAdd(formulaComponents[i]);
                let parentObj = db[rowId][colId];

                //    find index
                // remove your self
                let remChArr = parentObj.children.filter(function (chObj) {
                    return !(chObj.rowId == chrowId && chObj.colId == chcolId)
                })
                parentObj.children = remChArr;

            }
        }

    }

    function getRcfromAdd(cellElemAdd) {
        let Ascii = Number(cellElemAdd.charCodeAt(0));
        let colId = Ascii - 65;
        console.log(colId)
        let rowId = Number(cellElemAdd.substring(1)) - 1;
        return {
            colId,
            rowId
        };
    }


    function getRC(element) {
        let rowId = $(element).attr("ri");
        let colId = $(element).attr("ci");
        return {
            rowId,
            colId
        };
    }
    function getCellObject(rowId,colId){
        return db[rowId][colId];
    }

    $(".cell").on("click", function () {
        let cellElemAdd = $("#address-container").val();
        console.log("Address:cell" + cellElemAdd);
        if (lastClickedCell) {
            $(lastClickedCell).removeClass("selected");
        }

        $(this).addClass("selected");
        let {
            rowId,
            colId
        } = getRC(this);
        console.log(rowId + "  " + colId)

        $("#formula-container").val(db[rowId][colId].formula);
        let isBold = db[rowId][colId].bold;
        if (isBold) {
            $("#bold").addClass("hasOn");
        } else {
            $("#bold").removeClass("hasOn");
        }
        let isItalic = db[rowId][colId].italic;
        if (isItalic) {
            $("#italic").addClass("hasOn");
        } else {
            $("#italic").removeClass("hasOn");
        }
        let isUnderline = db[rowId][colId].underline;
        if (isUnderline) {
            $("#underline").addClass("hasOn");
        } else {
            $("#underline").removeClass("hasOn");
        }
        $("#font").val(db[rowId][colId].fontStyle);
        $("#color").val(db[rowId][colId].color);
        $("#bgcolor").val(db[rowId][colId].bgcolor);
        $(".halign").val(db[rowId][colId]).alignment;
        $("#fontSize").val(db[rowId][colId].fontSize.toString());

         //StyleProper
         let height = $(this).height();
         let lcArr = $("#left-col .cell");
         let myCol = lcArr[rowId];
         $(myCol).css('height', height);
         let width = $(this).width();
         let trArr = $("#top-row .cell");
         let myrow = trArr[colId];
         $(myrow).css('width', width);
    })


    //================================================================ extra ==============================================
    $('#newPage').on('click', function () {
        var win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.loadFile('index.ejs').then(function () {
            // win.webContents.openDevTools();
            win.show();
            win.maximize();
        })
    });

    // zoom common code.......
    $('zoomIn').on('click', function () {
        let win = BrowserWindow.getFocusedWindow();
        win.webContents.setZoomFactor(1.0);
        win.webContents
            .setVisualZoomLevelLimits(1, 5)
            .then(console.log("Zoom Levels Have been Set between 100% and 500%"))
            .catch((err) => console.log(err));
        win.webContents.on("zoom-changed", (event, zoomDirection) => {
            console.log(zoomDirection);
            var currentZoom = win.webContents.getZoomFactor();
            console.log("Current Zoom Factor - ", currentZoom);
            console.log("Current Zoom Level at - ", win.webContents.zoomLevel);
            if (zoomDirection === "in") {
                win.webContents.zoomFactor = currentZoom + 0.2;
                console.log("Zoom Factor Increased to - ", win.webContents.zoomFactor * 100, "%");
            }
        });
    })

    $('zoomOut').on('click', function () {
        let win = BrowserWindow.getFocusedWindow();
        win.webContents.setZoomFactor(1.0);
        win.webContents
            .setVisualZoomLevelLimits(1, 5)
            .then(console.log("Zoom Levels Have been Set between 100% and 500%"))
            .catch((err) => console.log(err));
        win.webContents.on("zoom-changed", (event, zoomDirection) => {
            console.log(zoomDirection);
            var currentZoom = win.webContents.getZoomFactor();
            console.log("Current Zoom Factor - ", currentZoom);
            console.log("Current Zoom Level at - ", win.webContents.zoomLevel);
            if (zoomDirection === "out") {
                win.webContents.zoomFactor = currentZoom - 0.2;
                console.log("Zoom Factor Decreased to - ", win.webContents.zoomFactor * 100, "%");
            }
        });
    })

    //cut,copy,paste button
    $("#copy").on("click",function(){
        copy=$("#grid .cell.selected").html();
        cut="";
    })
    $("#cut").on("click",function(){
        cut=$("#grid .cell.selected").html();
        copy="";
        let selectedCell=$("#grid .cell.selected");
        let {rowId,colId}=getRC(selectedCell);
        let cellObject=getCellObject(rowId,colId)
        if(cellObject.formula){
            removeFormula(cellObject,rowId,colId);
        }
        $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html("");
        //change left col height
        $(selectedCell).keyup();
    })
    $("#paste").on("click",function(){
        paste=cut?cut:copy
        $("#grid .cell").html=paste;
        if(!cut&&!copy){
            return
        }
        let selectedCell=$("#grid .cell");
        let {rowId,colId}=getRC(selectedCell);
        let cellObject=getCellObject(rowId,colId)

        if(cellObject.formula){
            removeFormula(cellObject,rowId,colId);
        }
        updateCell(cellObject,rowId,colId,paste)
        paste=""
        cut=""
        copy=""
    })


    $("#deleterow").on("click",function(){
        let rowId= Number($("#grid .cell").attr("ri"));
        if(Number.isNaN(rowId)){
         dialog.showErrorBox("Sorry !","Please select a cell")
         return;
         }
         db.splice(rowId,1)
         let row=[]
         for(let col=0;col<db[0].length;col++){
             let cell={
                value: "",
                formula: "",
                children: [],
                fontSize: 14,
                fontStyle: "Noto Sans",
                bold: false,
                italic: false,
                underline: false,
                color: "black",
                bgcolor:"white",
                halign: "center"
                }
             row.push(cell);
         }
         db.push(row);
         let rows=$("#grid").find(".row")
         for(let i=rowId;i<rows.length;i++){
             let cells=$(rows[i]).find(".cell");
             for(let j=0;j<cells.length;j++){
                let cell=db[i][j]
                $(cells[j]).html(db[i][j].value);
                $(cells[j]).css("font-family",cell.fontStyle);
                $(cells[j]).css("font-size",cell.fontSize+"px");
                $(cells[j]).css("font-weight",cell.bold?"bold":"normal");
                $(cells[j]).css("text-decoration",cell.underline?"underline":"none");
                $(cells[j]).css("font-style",cell.italic?"italic":"normal");
                $(cells[j]).css("color",cell.color);
                $(cells[j]).css("background-color",cell.bgcolor);
                $(cells[j]).css("text-align",cell.halign);
             }
         }
     })
     $("#newrow").on("click",function(){
         let rowId= Number($("#grid .cell").attr("ri"));
         if(Number.isNaN(rowId)){
             dialog.showErrorBox("Sorry !","Please select a cell")
             return;
         }
         let row=[]
         for(let col=0;col<db[0].length;col++){
             let cell={
                value: "",
                formula: "",
                children: [],
                fontSize: 14,
                fontStyle: "Noto Sans",
                bold: false,
                italic: false,
                underline: false,
                color: "black",
                bgcolor:"white",
                halign: "center"
                 }
             row.push(cell);
         }
         db.splice(rowId,0,row);
         db.pop();
          let rows=$("#grid").find(".row")
         console.log($(rows[db.length-1]).html())
         for(let i=rowId;i<rows.length;i++){
             let cells=$(rows[i]).find(".cell");
             for(let j=0;j<cells.length;j++){
                let cell=db[i][j]
                $(cells[j]).html(db[i][j].value);
                $(cells[j]).css("font-family",cell.fontStyle);
                $(cells[j]).css("font-size",cell.fontSize+"px");
                $(cells[j]).css("font-weight",cell.bold?"bold":"normal");
                $(cells[j]).css("text-decoration",cell.underline?"underline":"none");
                $(cells[j]).css("font-style",cell.italic?"italic":"normal");
                $(cells[j]).css("color",cell.color);
                $(cells[j]).css("background-color",cell.bgcolor);
                $(cells[j]).css("text-align",cell.halign);
             }
         }
     })
     $("#deletecol").on("click",function(){
         let colId= Number($("#grid .cell").attr("ci"));
         if(Number.isNaN(colId)){
             dialog.showErrorBox("Sorry !","Please select a cell")
             return;
         }
         for(let row=0;row<db.length;row++){
             let cell={
                value: "",
                formula: "",
                children: [],
                fontSize: 14,
                fontStyle: "Noto Sans",
                bold: false,
                italic: false,
                underline: false,
                color: "black",
                bgcolor:"white",
                halign: "center"
                 }
                 db[row].splice(colId,1);
                 db[row].push(cell);
         }
         let rows=$("#grid").find(".row")
         for(let i=0;i<rows.length;i++){
             let cells=$(rows[i]).find(".cell");
             for(let j=colId;j<cells.length;j++){
                let cell=db[i][j]
                $(cells[j]).html(db[i][j].value);
                $(cells[j]).css("font-family",cell.fontStyle);
                $(cells[j]).css("font-size",cell.fontSize+"px");
                $(cells[j]).css("font-weight",cell.bold?"bold":"normal");
                $(cells[j]).css("text-decoration",cell.underline?"underline":"none");
                $(cells[j]).css("font-style",cell.italic?"italic":"normal");
                $(cells[j]).css("color",cell.color);
                $(cells[j]).css("background-color",cell.bgcolor);
                $(cells[j]).css("text-align",cell.halign);
             }
         }
     })
     $("#newcol").on("click",function(){
         let colId= Number($("#grid .cell").attr("ci"));
         if(Number.isNaN(colId)){
             dialog.showErrorBox("Sorry !","Please select a cell")
             return;
         }
         for(let row=0;row<db.length;row++){
             let cell={
                value: "",
                formula: "",
                children: [],
                fontSize: 14,
                fontStyle: "Noto Sans",
                bold: false,
                italic: false,
                underline: false,
                color: "black",
                bgcolor:"white",
                halign: "center"
                 }
                 db[row].splice(colId,0,cell);
                 db[row].pop();
         }
         let rows=$("#grid").find(".row")
         for(let i=0;i<rows.length;i++){
             let cells=$(rows[i]).find(".cell");
             for(let j=colId;j<cells.length;j++){
                let cell=db[i][j]
                $(cells[j]).html(db[i][j].value);
                $(cells[j]).css("font-family",cell.fontStyle);
                $(cells[j]).css("font-size",cell.fontSize+"px");
                $(cells[j]).css("font-weight",cell.bold?"bold":"normal");
                $(cells[j]).css("text-decoration",cell.underline?"underline":"none");
                $(cells[j]).css("font-style",cell.italic?"italic":"normal");
                $(cells[j]).css("color",cell.color);
                $(cells[j]).css("background-color",cell.bgcolor);
                $(cells[j]).css("text-align",cell.halign);
             }
         }
     })
    function init() {
        $("#New").trigger("click");
    }
    init();
})