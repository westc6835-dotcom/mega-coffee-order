import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc,
  query, orderBy, serverTimestamp, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN_PASSWORD = "1234"; // 실제 사용 전 꼭 변경하세요.

const MENU_DATA = [
  { name:"아메리카노", price:2000, temps:["ICE","HOT"] },
  { name:"카페라떼", price:2900, temps:["ICE","HOT"] },
  { name:"바닐라라떼", price:3400, temps:["ICE","HOT"] },
  { name:"카라멜마끼아또", price:3700, temps:["ICE","HOT"] },
  { name:"카페모카", price:3900, temps:["ICE","HOT"] },
  { name:"헤이즐넛라떼", price:3400, temps:["ICE","HOT"] },
  { name:"콜드브루", price:3500, temps:["ICE"] },
  { name:"초코라떼", price:3500, temps:["ICE","HOT"] },
  { name:"녹차라떼", price:3500, temps:["ICE","HOT"] },
  { name:"딸기라떼", price:3700, temps:["ICE"] },
  { name:"고구마라떼", price:3500, temps:["ICE","HOT"] },
  { name:"복숭아 아이스티", price:3000, temps:["ICE"] },
  { name:"레몬에이드", price:3500, temps:["ICE"] },
  { name:"자몽에이드", price:3500, temps:["ICE"] },
  { name:"청포도에이드", price:3500, temps:["ICE"] },
  { name:"유자차", price:3300, temps:["HOT"] },
  { name:"자몽차", price:3300, temps:["HOT"] },
  { name:"캐모마일", price:3000, temps:["HOT"] },
  { name:"페퍼민트", price:3000, temps:["HOT"] }
];

const config = window.firebaseConfig;
if (!config || !config.apiKey || config.apiKey.includes("여기에")) {
  alert("firebase-config.js 설정이 필요합니다. README.md를 참고해 주세요.");
}

const app = initializeApp(config);
const db = getFirestore(app);
const ordersRef = collection(db, "orders");
const settingsRef = doc(db, "settings", "orderStatus");

let orders = [];
let isAdmin = false;
let orderingOpen = true;
let filteredMenu = [...MENU_DATA];

const $ = (id) => document.getElementById(id);

function money(n){ return Number(n || 0).toLocaleString("ko-KR") + "원"; }
function clean(text){ return String(text ?? "").replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#039;"}[c])); }

function showPage(page){
  $("orderPage").classList.toggle("hidden", page !== "order");
  $("adminPage").classList.toggle("hidden", page !== "admin");
  $("orderTab").classList.toggle("active", page === "order");
  $("adminTab").classList.toggle("active", page === "admin");
  if(page === "admin") renderAdmin();
}

function renderMenu(){
  const drink = $("drink");
  drink.innerHTML = `<option value="">메뉴를 선택하세요</option>` + filteredMenu.map((m, idx) =>
    `<option value="${idx}">${clean(m.name)} - ${money(m.price)}</option>`
  ).join("");
  renderTemps();
  updatePrice();
}

function renderTemps(){
  const selected = filteredMenu[$("drink").value];
  const temps = selected?.temps || ["ICE","HOT"];
  $("temperature").innerHTML = temps.map(t => `<option value="${t}">${t}</option>`).join("");
}

function getPrice(){
  const item = filteredMenu[$("drink").value];
  let total = item?.price || 0;
  total += Number($("size").selectedOptions[0]?.dataset.extra || 0);
  document.querySelectorAll(".option:checked").forEach(o => total += Number(o.dataset.extra || 0));
  return total;
}
function updatePrice(){ $("pricePreview").textContent = money(getPrice()); }

async function submitOrder(){
  if(!orderingOpen){ alert("현재 주문이 마감되었습니다."); return; }
  const name = $("teacherName").value.trim();
  const item = filteredMenu[$("drink").value];
  if(!name){ alert("이름을 입력해 주세요."); return; }
  if(!item){ alert("음료 메뉴를 선택해 주세요."); return; }
  const order = {
    name,
    drink:item.name,
    basePrice:item.price,
    temperature:$("temperature").value,
    size:$("size").value,
    options:Array.from(document.querySelectorAll(".option:checked")).map(o => o.value),
    request:$("request").value.trim(),
    price:getPrice(),
    createdAt:serverTimestamp(),
    createdText:new Date().toLocaleString("ko-KR")
  };
  await addDoc(ordersRef, order);
  alert("주문이 제출되었습니다.");
  $("teacherName").value = ""; $("drink").value = ""; $("request").value = ""; $("size").value = "기본";
  document.querySelectorAll(".option").forEach(o => o.checked = false);
  renderTemps(); updatePrice();
}

function renderAdmin(){
  if(!isAdmin) return;
  $("totalCount").textContent = orders.length;
  $("totalPrice").textContent = money(orders.reduce((a,o)=>a+Number(o.price||0),0));

  const byMenu = new Map();
  orders.forEach(o => {
    const key = `${o.drink} / ${o.temperature} / ${o.size}`;
    const now = byMenu.get(key) || { count:0, total:0 };
    now.count += 1; now.total += Number(o.price || 0);
    byMenu.set(key, now);
  });
  $("menuSummary").innerHTML = [...byMenu.entries()].map(([menu,v]) =>
    `<tr><td>${clean(menu)}</td><td>${v.count}</td><td>${money(v.total)}</td></tr>`
  ).join("") || `<tr><td colspan="3">아직 주문이 없습니다.</td></tr>`;

  $("orderList").innerHTML = orders.map(o => `
    <tr>
      <td>${clean(o.createdText)}</td>
      <td>${clean(o.name)}</td>
      <td>${clean(o.drink)}<br>${clean(o.temperature)} / ${clean(o.size)}<br>${clean((o.options||[]).join(", ") || "옵션 없음")}</td>
      <td>${clean(o.request || "-")}</td>
      <td>${money(o.price)}</td>
      <td><button class="small-btn" data-delete="${o.id}">삭제</button></td>
    </tr>`).join("") || `<tr><td colspan="6">아직 주문이 없습니다.</td></tr>`;

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = async () => {
      if(confirm("이 주문을 삭제할까요?")) await deleteDoc(doc(db, "orders", btn.dataset.delete));
    };
  });
  $("toggleOrdering").textContent = orderingOpen ? "주문 마감하기" : "주문 다시 열기";
}

function downloadCSV(){
  if(!orders.length){ alert("다운로드할 주문이 없습니다."); return; }
  const headers = ["주문시간","이름","메뉴","HOT/ICE","사이즈","옵션","요청사항","금액"];
  const rows = orders.map(o => [o.createdText,o.name,o.drink,o.temperature,o.size,(o.options||[]).join(" / "),o.request,o.price]);
  const csv = [headers,...rows].map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "메가커피_단체주문.csv"; a.click(); URL.revokeObjectURL(url);
}

async function toggleOrdering(){
  await setDoc(settingsRef, { open: !orderingOpen, updatedAt: serverTimestamp() });
}
async function clearOrders(){
  if(!confirm("전체 주문을 삭제할까요? 되돌릴 수 없습니다.")) return;
  await Promise.all(orders.map(o => deleteDoc(doc(db, "orders", o.id))));
}

$("orderTab").onclick = () => showPage("order");
$("adminTab").onclick = () => showPage("admin");
$("drink").onchange = () => { renderTemps(); updatePrice(); };
$("size").onchange = updatePrice;
document.querySelectorAll(".option").forEach(o => o.onchange = updatePrice);
$("submitOrder").onclick = submitOrder;
$("downloadCSV").onclick = downloadCSV;
$("toggleOrdering").onclick = toggleOrdering;
$("clearOrders").onclick = clearOrders;
$("loginButton").onclick = () => {
  if($("adminPassword").value !== ADMIN_PASSWORD){ alert("비밀번호가 맞지 않습니다."); return; }
  isAdmin = true; $("loginBox").classList.add("hidden"); $("adminContent").classList.remove("hidden"); renderAdmin();
};
$("menuSearch").oninput = () => {
  const keyword = $("menuSearch").value.trim().toLowerCase();
  filteredMenu = MENU_DATA.filter(m => m.name.toLowerCase().includes(keyword));
  renderMenu();
};

onSnapshot(query(ordersRef, orderBy("createdAt", "desc")), snap => {
  orders = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  renderAdmin();
});

onSnapshot(settingsRef, snap => {
  orderingOpen = snap.exists() ? snap.data().open !== false : true;
  $("orderStatusBadge").textContent = orderingOpen ? "주문 가능" : "주문 마감";
  $("orderStatusBadge").classList.toggle("closed", !orderingOpen);
  $("submitOrder").disabled = !orderingOpen;
  $("submitOrder").textContent = orderingOpen ? "주문 제출" : "주문 마감됨";
  renderAdmin();
});

(async function init(){
  const s = await getDoc(settingsRef);
  if(!s.exists()) await setDoc(settingsRef, { open:true, updatedAt:serverTimestamp() });
  renderMenu(); showPage("order");
})();
