<script setup>
import { ref } from 'vue'
import CodeComponent from './CodeComponent.vue'

const files = [
  {
    name: 'Python файл на 3',
    code: `import database_creatorplus as dc
import pandas as pd
import flet as ft

db = dc.Database("DB_test")

db.Table.create(db,"partners",["id","type","name","owner","email","number","adres","inn","rate"],
                ["INTEGER PRIMARY KEY AUTOINCREMENT","TEXT","TEXT","TEXT","TEXT","TEXT","TEXT","INTEGER","INTEGER"])

def import_data(path_file,table_name):
    df = pd.read_excel(path_file)
    for i in df.values:
        db.Table.write(db,table_name,*i)

import_data("Partners_import.xlsx","partners")

def get_columns(data):
    list = []
    for i in data:
        list.append(ft.DataColumn(ft.Text(i)))
    return list

def get_rows(data):
    list = []
    for i in data:
        list1 = []
        for j in i:
            list1.append(ft.DataCell(ft.Text(j)))
        list.append(ft.DataRow(list1))
    return list

def main(page:ft.Page):

    def route_change(route):
        page.views.clear()
        table_partners = ft.DataTable(get_columns(db.Info.getColumns(db,"partners")),
                                      get_rows(db.Table.get(db,"partners")))

        if page.route == "/main_menu":
            page.views.append(
                ft.View(
                    route="/main_menu",
                    controls=[
                        ft.ElevatedButton("Партнеры",on_click=lambda e: page.go("/partners"))
                    ]
                )
            )
        elif page.route == "/partners":
            page.views.append(
                ft.View(
                    route="/partners",
                    controls=[
                        table_partners
                    ]
                )
            )
        page.update()

    page.on_route_change = route_change
    page.go("/main_menu")

ft.app(main)`
  },
  {
    name: 'Python файл на 4',
    code: `import flet as ft
import database_creatorplus as dc
import pandas as pd
import os

PRIMARY_COLOR = "#67BA80"
SECONDARY_BG = "#F4E8D3"
FONT_FAMILY = "Segoe UI"

db = dc.Database("BD")


db.Table.create(db,"partners",["id","type","name","director","email","number","adres","inn","rate"],["INTEGER PRIMARY KEY AUTOINCREMENT","TEXT","TEXT","TEXT","TEXT","TEXT","TEXT","TEXT","TEXT"])
db.Table.create(db,"product",["id","type","name","articyl","price"],["INTEGER PRIMARY KEY AUTOINCREMENT","TEXT","TEXT","TEXT","TEXT"])
db.Table.create(db,"product_partner",["product","name","count","data"],["TEXT","TEXT","TEXT","TEXT"])


def partner_card(data_):
    list = []

    for data in data_:
        total_sales = int(db.Table.get(db,"product_partner","name , SUM(count)",f"Where name = '{data[2]}'")[0][1])
        sales = (
        "0%" if total_sales < 10000 else
        "5%" if total_sales < 50000 else
        "10%" if total_sales < 300 else
        "15%"
        )
        list.append(ft.Card(
            content=ft.Container(
                width=400,
                padding=20,
                bgcolor=SECONDARY_BG,
                content=ft.Column(
                    [
                        ft.Row(
                            [
                                ft.Text(data[1], size=14, font_family=FONT_FAMILY),
                                ft.Text(sales, size=14, weight=ft.FontWeight.BOLD, color=PRIMARY_COLOR)
                            ],
                            alignment=ft.MainAxisAlignment.SPACE_BETWEEN
                        ),
                        ft.Text(data[2], size=18, weight=ft.FontWeight.BOLD, font_family=FONT_FAMILY),
                        ft.Text(data[3], size=30, font_family=FONT_FAMILY),
                        ft.Row([ft.Text(data[5], size=14, font_family=FONT_FAMILY)], spacing=5),
                        ft.Row([ft.Text(data[8], size=14, font_family=FONT_FAMILY)], spacing=5)
                    ],
                    spacing=8
                )
            ),
            elevation=5,
            margin=10
        )
    )
    return list

cwd = os.getcwd()

def main(page:ft.Page):
    page.fonts = {"Segoe UI": "fonts/SegoeUI.ttf"}
    page.bgcolor = ft.Colors.WHITE
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.CENTER
    page.title = "Application"
    page.window.maximized = True
    page.window.resizable = False
    page.window.icon = f"{cwd}\\icon.ico"
    img = ft.Image(
        width = 600,
        height= 600,
        src=f"assets/image.png",
        fit=ft.ImageFit.CONTAIN,
    )

    partner = ft.TextField(label="Введите ссылку на файл")
    lv_partners = ft.ListView(spacing=10, padding=20, width=2000, auto_scroll=True,height=500)
    lv_product = ft.ListView(spacing=10, padding=20, width=2000, auto_scroll=True,height=500)

    def get_columns(data):
        list = []
        for i in data:
            list.append(ft.DataColumn(ft.Text(i)))
        list.append(ft.DataColumn(ft.Text("del")))
        return list

    def get_rows(data,table_name,route):
        list = []
        for i in data:
            list2 = []
            for j in i:
                list2.append(ft.DataCell(ft.Text(str(j))))
            list2.append(ft.DataCell(ft.ElevatedButton(text="del",on_click= lambda e, id = i[0]: [db.Table.delete(db,table_name,f"id = {id}"),route_change(route)])))
            list.append(ft.DataRow(list2))
        return list

    def import_data(path_data, table_name, route):
        df = pd.read_excel(path_data)
        for i in df.values:
            db.Table.write(db,table_name,*i)
        route_change(route)

    def route_change(route):
        page.views.clear()
        lv_partners.controls.clear()
        lv_product.controls.clear()
        datatable_partners = ft.DataTable(get_columns(db.Info.getColumns(db,"partners")),get_rows(db.Table.get(db,"partners"),"partners","/partner_table"))
        lv_partners.controls.append(datatable_partners)
        datatable_product = ft.DataTable(get_columns(db.Info.getColumns(db,"product")),get_rows(db.Table.get(db,"product"),"product","/product_table"))
        lv_product.controls.append(datatable_product)
        if page.route == "/":
            page.views.append(
                ft.View(
                    route="/",
                    controls=[
                        ft.AppBar(title=ft.Text("Главное меню",font_family=FONT_FAMILY)),
                        ft.Row([img,
                                ft.Column(
                                    controls=[
                                ft.ElevatedButton(
                                    "Карточки партнера",
                                    bgcolor = SECONDARY_BG,
                                    width=300,
                                    height=50,
                                    on_click=lambda _: page.go("/cards_partner")
                                ),
                                ft.ElevatedButton(
                                    "Партнеры",
                                    bgcolor = SECONDARY_BG,
                                    width=300,
                                    height=50,
                                    on_click=lambda _: page.go("/partner_table")
                                ),
                                ft.ElevatedButton(
                                    "Продукты",
                                    bgcolor = SECONDARY_BG,
                                    width=300,
                                    height=50,
                                    on_click=lambda _: page.go("/product_table")
                                ),
                            ],
                            alignment=ft.MainAxisAlignment.CENTER,
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            expand=True
                            )]
                        ),
                    ],vertical_alignment=ft.MainAxisAlignment.CENTER,
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                )
            )


        elif page.route == "/cards_partner":
            page.views.append(
                ft.View(
                    route="/cards_partner",
                    controls=[
                        ft.AppBar(title=ft.Text("Карточки партнеров")),
                        ft.Column(partner_card(db.Table.get(db,"partners")), scroll=ft.ScrollMode.AUTO,width=500,height=500),
                        ft.ElevatedButton(
                            "Вернуться на главную",
                            on_click=lambda _: page.go("/")
                        )
                    ],
                    vertical_alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                )
            )

        elif page.route == "/partner_table":
            data = db.Info.getColumns(db,"partners")
            field = [ft.TextField(label=data[i],width=200) for i in range(1,len(data))]
            page.views.append(
                ft.View(
                    route="/partner_table",
                    controls=[
                        ft.AppBar(title=ft.Text("Партнеры")),
                        lv_partners,
                        ft.Row([partner, ft.ElevatedButton(text="Импортировать данные",on_click= lambda e: import_data(partner.value, "partners","/partner_table"))]),
                        ft.Row(field),
                        ft.ElevatedButton("Добавить данные",on_click = lambda e: [db.Table.write(db, "partners",*[i.value for i in field]),route_change("/partner_table")]),
                        ft.ElevatedButton(
                            "Вернуться на главную",
                            on_click=lambda _: page.go("/")
                        )
                    ]
                )
            )
        elif page.route == "/product_table":
            data = db.Info.getColumns(db,"product")
            field = [ft.TextField(label=data[i],width=200) for i in range(1,len(data))]
            page.views.append(
                ft.View(
                    route="/product_table",
                    controls=[
                        ft.AppBar(title=ft.Text("Партнеры")),
                        lv_product,
                        ft.Row([partner, ft.ElevatedButton(text="Импортировать данные",on_click= lambda e: import_data(partner.value, "product","/product_table"))]),
                        ft.Row(field),
                        ft.ElevatedButton("Добавить данные",on_click = lambda e: [db.Table.write(db, "product",*[i.value for i in field]),route_change("/product_table")]),
                        ft.ElevatedButton(
                            "Вернуться на главную",
                            on_click=lambda _: page.go("/")
                        )
                    ]
                )
            )

        page.update()

    page.on_route_change = route_change
    page.go("/")

ft.app(main)`
  }
]

const selectedFile = ref(files[0])
const showS3 = ref(false)
const basefor4 = 'https://minio.tsukawa.ru/exam/DEMO/BD.db'
const basefor3 = 'https://minio.tsukawa.ru/exam/DEMO/DB_test.db'// <-- замените на актуальное имя файла
</script>

<template>
  <div class="cheatsheet">
    <section class="install-section">
      <h1>Установка библиотек</h1>
      <pre><code>pip install flet
pip install pandas
pip install database_creatorplus</code></pre>
    </section>

    <section class="files-section">
      <div class="files-list">
        <h2>Файлы</h2>
        <ul>
          <li
              v-for="file in files"
              :key="file.name"
              :class="{ active: file.name === selectedFile.name && !showS3 }"
              @click="() => { selectedFile = file; showS3 = false }"
          >
            {{ file.name }}
          </li>
          <li class="s3-link" :class="{ active: showS3 }" @click="showS3 = true">
            📂 Файлы демо проекта
          </li>
        </ul>
      </div>

      <div class="code-viewer">
        <CodeComponent v-if="!showS3" :code="selectedFile.code" />
        <div v-else class="s3-box">
          <h3>Файлы на 4:</h3>
          <a :href="basefor4" target="_blank">База:  {{ basefor4 }}</a>
          <h3>Файлы на 3:</h3>
          <a :href="basefor3" target="_blank">База:  {{ basefor3 }}</a>
          <h2>Ссылка на S3(ИСПОЛЬЗОВАТЬ ОСТОРОЖНО)</h2>
          <a target="_blank" href="https://minio.tsukawa.ru/browser/exam/DEMO%2FBD.db">https://minio.tsukawa.ru/browser/exam/DEMO%2FBD.db</a>
          <p>admin</p>
          <p>damnShitISfuckingMiniO</p>

        </div>
        <button @click="showS3 = false">⬅ Вернуться к коду</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cheatsheet {
  padding: 1rem;
  font-family: sans-serif;
}

.install-section pre {
  background: #434343;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.files-section {
  display: flex;
  margin-top: 2rem;
  gap: 1rem;
}

.files-list {
  width: 220px;
}

.files-list ul {
  list-style: none;
  padding: 0;
}

.files-list li {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.files-list li:hover,
.files-list li.active {
  background: #434343;
}

.s3-link {
  font-weight: bold;
  color: #0077cc;
}

.code-viewer {
  flex: 1;
}

.s3-box {
  background: #434343;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
}

.s3-box a {
  color: #0077cc;
  word-break: break-all;
}

.s3-box button {
  margin-top: 1rem;
  background: #ddd;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
