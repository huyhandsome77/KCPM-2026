/*==================================================
                MENU
==================================================*/

const productGrid=document.getElementById("productGrid");

const categorySelect=document.getElementById("categorySelect");

const searchInput=document.getElementById("searchInput");

const cartItems=document.getElementById("cartItems");

const totalPrice=document.getElementById("totalPrice");

let products=[];

let categories=[];

let cart=[];

/*==================================================
                INIT
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

loadCategories();

loadProducts();

searchInput.addEventListener(

"input",

renderProducts

);

categorySelect.addEventListener(

"change",

renderProducts

);

document

.getElementById("checkoutBtn")

.addEventListener(

"click",

checkout

);

}

);

/*==================================================
            CATEGORY
==================================================*/

async function loadCategories(){

try{

categories=await api("/api/categories");

categories.forEach(category=>{

categorySelect.innerHTML+=`

<option value="${category.id}">

${category.name}

</option>

`;

});

}

catch(err){

console.log(err);

}

}


/*==================================================
                PRODUCT
==================================================*/

async function loadProducts(){

try{

products=await api(

"/api/products"

);

renderProducts();

}

catch(err){

console.log(err);

showToast(

"Không tải được thực đơn."

);

}

}


function renderProducts(){

const keyword=

searchInput.value

.toLowerCase();

const category=

categorySelect.value;

const list=

products.filter(product=>{

const matchName=

product.name

.toLowerCase()

.includes(keyword);

const matchCategory=

category==="" ||

product.category_id==category;

return matchName && matchCategory;

});

productGrid.innerHTML="";

if(list.length===0){

productGrid.innerHTML=

`

<div class="empty">

Không có món ăn.

</div>

`;

return;

}

list.forEach(renderCard);

}


/*==================================================
                PRODUCT CARD
==================================================*/

function renderCard(product){

    productGrid.innerHTML += `

    <div class="product-card">

        <img src="${
            product.image && product.image !== ""
                ? product.image
                : "./assets/images/no-image.png"
        }">

        <div class="product-content">

            <h3>

                ${product.name}

            </h3>

            <p>

                ${product.description || ""}

            </p>

            <div class="product-footer">

                <div class="product-price">

                    ${Number(product.price).toLocaleString("vi-VN")}đ

                </div>

                <button

                    class="add-cart"

                    onclick="addToCart(${product.id})">

                    <i class="fa-solid fa-cart-plus"></i>

                </button>

            </div>

        </div>

    </div>

    `;

}

/*==================================================
                CART
==================================================*/

window.addToCart=function(id){

    const product=

    products.find(

        p=>p.id===id

    );

    if(!product) return;

    const item=

    cart.find(

        i=>i.id===id

    );

    if(item){

        item.quantity++;

    }

    else{

        cart.push({

            ...product,

            quantity:1

        });

    }

    renderCart();

    showToast(

        "Đã thêm vào giỏ hàng."

    );

}


function renderCart(){

    cartItems.innerHTML="";

    let total=0;

    if(cart.length===0){

        cartItems.innerHTML=`

        <div class="empty-cart">

            Chưa có món ăn.

        </div>

        `;

        totalPrice.innerHTML="0đ";

        return;

    }

    cart.forEach(item=>{

        total+=

        item.quantity*

        Number(item.price);

        cartItems.innerHTML+=`

        <div class="cart-item">

            <div class="cart-info">

                <h4>

                    ${item.name}

                </h4>

                <span>

                    ${Number(item.price).toLocaleString("vi-VN")}đ

                </span>

            </div>

            <div class="quantity">

                <button onclick="minus(${item.id})">

                    -

                </button>

                <span>

                    ${item.quantity}

                </span>

                <button onclick="plus(${item.id})">

                    +

                </button>

            </div>

        </div>

        `;

    });

    totalPrice.innerHTML=

    total.toLocaleString("vi-VN")+"đ";

}


window.plus=function(id){

    const item=

    cart.find(

        p=>p.id===id

    );

    if(item){

        item.quantity++;

        renderCart();

    }

}


window.minus=function(id){

    const item=

    cart.find(

        p=>p.id===id

    );

    if(!item) return;

    item.quantity--;

    if(item.quantity<=0){

        cart=

        cart.filter(

            p=>p.id!==id

        );

    }

    renderCart();

}


/*==================================================
                CHECKOUT
==================================================*/

async function checkout(){

    if(cart.length===0){

        showToast(

            "Giỏ hàng đang trống."

        );

        return;

    }

    const token=

    localStorage.getItem(

        TOKEN_KEY

    );

    if(!token){

        showToast(

            "Vui lòng đăng nhập."

        );

        setTimeout(()=>{

            location.href="login.html";

        },800);

        return;

    }

    const body={

        items:cart.map(item=>({

            product_id:item.id,

            quantity:item.quantity

        })),

        note:"Đặt món từ Website"

    };

    try{

        const result=

        await api(

            "/api/orders",

            {

                method:"POST",

                body:JSON.stringify(body)

            }

        );

        showToast(

            result.message ||

            "Đặt món thành công."

        );

        cart=[];

        renderCart();

    }

    catch(error){

        console.log(error);

        showToast(error.message);

    }

}


renderCart();