function sentRssToMailHTML(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSSシート');
  var recipient = PropertiesService.getUserProperties().getProperty('email'); 
  
  //昨日の日付を取得
  var date = new Date();
  date.setDate(date.getDate() - 1);
  var yesterday = Utilities.formatDate(date, 'Asia/Tokyo', 'YYYY-MM-dd');
  
  var lastRow = sh.getLastRow();
  
  //スプレッドシートにあるRSSフィードの数だけループを回す
  for(var i=2;i<lastRow+1;i++){
    var canSendMail = false;
    var subject = sh.getRange(i, 1).getValue(); //メールの題名
    var feedURL = sh.getRange(i, 2).getValue(); //RSSフィードのURL
    var body = "<div style='width:100%;max-width:650px'>"; //メールの本文
    body += "<table'>";
    body += '<tr><td></td><td><h2 style="font-weight:normal;margin:0px;">' + subject + '</h2>' + yesterday + '</td><td></td><tr>';
    
    //RSSフィードからitemsを取得
    var res = UrlFetchApp.fetch(feedURL);
    var xml = XmlService.parse(res.getContentText());
    var items = xml.getRootElement().getChildren('channel')[0].getChildren('item');
    
    //itemの数だけループ
    for(var j=0; j<items.length; j++){
      //発行日を取得する
      var pubDate = items[j].getChild('pubDate').getText();
      pubDate = Utilities.formatDate(new Date(pubDate), 'Asia/Tokyo', 'YYYY-MM-dd');
      
      //取得したitemのうち発行日が昨日のitemのみをbodyに追加
      if(yesterday == pubDate){
        canSendMail = true;
        var title = items[j].getChild('title').getText();
        var des = "";
        var des = items[j].getChild('description').getText();
        var url = items[j].getChild('link').getText();
        body += '<tr>';
        body += '<td style="padding-left:18px"></td>';
        body += '<td style="padding:18px 0px 12px 0px;vertical-align:top;border-top: ridge 1px">';
        body += '<h3 style="margin:0px; font-weight:normal"><a style="style="color:#427fed;display:inline;text-decoration:none;font-size:16px;line-height:20px;" href="' + url + '">' + title + '</a></h3>';
        body += des + '\n';
        body += '</td>';
        body += '<td style="padding-right:18px"></td>';
        body += '</tr>';
      }
    }
    body += "</table></div>";
    
    //昨日更新の記事がある場合のみメールを送信
    if(canSendMail === true){
      MailApp.sendEmail(recipient, subject, body, {htmlBody:body});
    }
  }
}
