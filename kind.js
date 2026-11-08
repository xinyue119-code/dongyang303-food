// 厨房：吃的和调料。index.html 里的程序和「化妆台」「杂物间」完全一样，区别都在这个文件。
// 2026-11-09 从杂物间分出来：杂物间里录的「调料」「食品」、厨房和冰箱里像吃的的存货，第一次打开时自动搬过来（见下面 migrate）。
window.KIND = {
  id: "fd",                  // 数据库集合前缀：fd_items / fd_photos / fd_meals
  name: "厨房",
  unit: "样",
  expiry: true,              // 只记包装上的期限
  paoOpts: [],
  expLabel: "保质期",
  idleDays: 30,
  colors: null,
  states: { open: "开了", new: "没开封" },
  locSpots: ["kitchen", "fridge"],   // 放在哪里只列厨房和冰箱（位置在杂物间的地图里增改）
  kitchen: true,             // 「今天吃」：看天气和家里的东西推荐菜（菜谱在 recipes.js）
  meals: true,               // 「做的饭」：记每天做了什么，用掉的东西顺手减掉
  noReview: true,            // 不要换季盘点
  cats: [
    { g: "蔬菜水果", items: [["蔬菜"], ["水果"], ["菌菇"]] },
    { g: "肉蛋水产", items: [["肉"], ["蛋"], ["鱼虾海鲜"]] },
    { g: "豆制品、奶", items: [["豆腐/豆制品"], ["奶/乳制品"]] },
    { g: "主食", items: [["米"], ["面条"], ["面包"], ["速食/泡面"], ["冷冻食品"]] },
    { g: "调料", items: [["酱油/醋"], ["盐/糖"], ["料酒/味醂"], ["酱料"], ["油"], ["粉/香料"], ["高汤/汤料"]] },
    { g: "零食饮料", items: [["零食"], ["饮料"], ["酒"]] },
    { g: "其他", items: [["罐头/干货"], ["其他食品"], ["其他调料"]] }
  ],
  brand: true,
  brandPh: "比如：キッコーマン / 李锦记 / 日清",
  searchHint: "找一找：酱油、鸡蛋、咖喱…",
  notePh: "比如：浓口酱油 / 鸡蛋 10 个装",
  shadeLabel: "规格",
  shadePh: "比如：1L / 500g / 6 个",
  photoHint: "拍包装正面，能看到名字就行",
  emptyHint: "还没有录入吃的。点右下角「＋ 录入」拍一张，选类别；没开封的囤货把状态选成「没开封」，填上数量。<br><br>冰箱里零零碎碎的东西不用一样样拍：在杂物间的地图里点开冰箱，写一段清单，「今天吃」也会算进去。",
  migrate: async db => {
    const flag = db.doc("meta/food-20261109");
    if ((await flag.get()).exists) return;
    // 名字里有这些字就归到这一类（先匹配到的算）
    const G = [
      ["酱油/醋", /酱油|生抽|老抽|醤油|しょうゆ|醋|酢|ポン酢/], ["料酒/味醂", /料酒|料理酒|みりん|味醂/],
      ["盐/糖", /盐|塩|砂糖|白糖|冰糖|红糖|^糖$/], ["油", /食用油|色拉油|サラダ油|橄榄油|オリーブ|菜籽油|ごま油|香油|芝麻油|花生油|キャノーラ|^油$/],
      ["酱料", /味噌|みそ|豆瓣|蚝油|オイスター|番茄酱|ケチャップ|蛋黄酱|マヨ|沙拉酱|甜面酱|辣酱|老干妈|ソース|酱/],
      ["粉/香料", /淀粉|片栗粉|面粉|小麦粉|胡椒|花椒|八角|桂皮|咖喱|カレー|香料|スパイス|唐辛子|辣椒粉|七味/],
      ["高汤/汤料", /鸡精|味精|だし|出汁|高汤|コンソメ|鶏ガラ|火锅|底料|鍋の素|鍋つゆ|汤料/],
      ["蛋", /鸡蛋|卵|たまご|^蛋/], ["豆腐/豆制品", /豆腐|納豆|纳豆|油揚げ|厚揚げ|豆皮|腐竹|豆乳/],
      ["奶/乳制品", /牛奶|牛乳|ミルク|酸奶|ヨーグルト|芝士|奶酪|チーズ|黄油|バター|奶油/],
      ["肉", /猪|豚|牛肉|牛こま|和牛|鸡肉|鸡腿|鸡胸|鶏|肉|ベーコン|ハム|ソーセージ|ウインナー|火腿|培根|香肠/],
      ["鱼虾海鲜", /鱼|鮭|サーモン|鯖|さば|鱈|虾|えび|エビ|蟹|贝|イカ|タコ|しらす|海带|わかめ|昆布|海苔|のり/],
      ["菌菇", /蘑菇|香菇|金针菇|きのこ|しめじ|椎茸|えのき|舞茸|エリンギ/],
      ["米", /大米|米饭|白米|お米|無洗米|无洗米|精米|新米|コシヒカリ|^米/],
      ["面条", /面条|挂面|乌冬|うどん|そば|拉面|ラーメン|意面|パスタ|素面|そうめん|焼きそば|米线/],
      ["速食/泡面", /泡面|方便面|カップ|インスタント|即席|袋麺|日清|レトルト|速食/],
      ["面包", /面包|吐司|パン/], ["冷冻食品", /冷冻|冷凍|饺子|餃子|年糕|もち|餅|汤圆/],
      ["酒", /啤酒|葡萄酒|红酒|白酒|清酒|日本酒|烧酒|焼酎|ビール|ワイン|梅酒|チューハイ|サワー|ハイボール/],
      ["饮料", /矿泉水|饮料|果汁|茶饮|咖啡|コーヒー|お茶|ジュース|コーラ|可乐|苏打|炭酸|水$/],
      ["零食", /零食|饼干|薯片|巧克力|チョコ|クッキー|ポテチ|せんべい|糖果|グミ|キャンディ|坚果|ナッツ/],
      ["罐头/干货", /罐头|缶|ツナ|金枪鱼|干货|木耳|粉丝|春雨|乾燥/],
      ["水果", /苹果|りんご|香蕉|バナナ|橘|みかん|葡萄|ぶどう|梨|桃|草莓|いちご|柠檬|レモン|猕猴桃|キウイ|水果/],
      ["蔬菜", /青菜|白菜|小松菜|菜花|生菜|空心菜|油菜|韭菜|芹菜|葱|ねぎ|ネギ|姜|生姜|蒜|にんにく|番茄|西红柿|トマト|土豆|じゃがいも|洋葱|玉ねぎ|胡萝卜|人参|萝卜|大根|黄瓜|きゅうり|茄子|なす|青椒|ピーマン|菠菜|ほうれん草|豆芽|もやし|キャベツ|白菜|玉米|コーン|南瓜|かぼちゃ|西兰花|ブロッコリー|レタス|生菜/]
    ];
    const guess = (name, dflt) => { for (const [c, re] of G) if (re.test(name)) return c; return dflt; };
    // 1. 杂物间里拍照录的调料、食品：同一个 id 复制过来（再跑一次也不会重复），照片一起搬，原来那条标成 moved
    for (const d of (await db.collection("zw_items").where("cat", "in", ["调料", "食品"]).get()).docs) {
      const x = d.data(); if (x.moved) continue;
      const name = [x.brand, x.note, x.shade].filter(Boolean).join(" ");
      await db.doc("fd_items/" + d.id).set({ ...x, cat: guess(name, x.cat === "调料" ? "其他调料" : "其他食品"), from: "zw" });
      const ph = await db.doc("zw_photos/" + d.id).get(); if (ph.exists) await db.doc("fd_photos/" + d.id).set(ph.data());
      await d.ref.update({ moved: "fd" });
    }
    // 2. 厨房、冰箱里的存货：冰箱里的都算吃的；厨房橱柜里名字像吃的才搬（洗洁精、湿巾这些留在杂物间）
    const locs = (await db.collection("locations").get()).docs.map(d => ({ id: d.id, ...d.data() }));
    const spotOf = id => (locs.find(l => l.id === id) || {}).spot;
    for (const d of (await db.collection("stock").get()).docs) {
      const s = d.data(), sp = spotOf(s.loc); if (s.moved || !["kitchen", "fridge"].includes(sp)) continue;
      const cat = guess(s.name || "", sp === "fridge" ? "其他食品" : ""); if (!cat) continue;
      const id = "st-" + d.id, left = (+s.qty || 0) > 0 || (+s.subQty || 0) > 0;
      await db.doc("fd_items/" + id).set({ cat, state: "new", note: s.name || "", brand: "", colors: [], loc: s.loc,
        shade: [s.unit, s.subUnit ? `里面还有 ${s.subQty || 0}${s.subUnit}` : ""].filter(Boolean).join(" · "),
        qty: Math.max(1, +s.qty || 1), opened: 0, pao: 0, exp: "", thumb: s.thumb || "", hasPhoto: !!s.thumb,
        status: left ? "active" : "gone", goneAt: left ? 0 : Date.now(), created: s.created || Date.now(),
        lastUsed: 0, usedCount: 0, reviews: {}, from: "stock" });
      if (s.thumb) { const ph = await db.doc("zw_photos/st-" + d.id).get(); if (ph.exists) await db.doc("fd_photos/" + id).set(ph.data()); }
      await d.ref.update({ moved: "fd" });
    }
    await flag.set({ done: Date.now() });
  }
};
