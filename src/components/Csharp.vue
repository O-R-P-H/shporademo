<script setup>
import { ref } from 'vue'
import CodeComponent from './CodeComponent.vue'

const files = [
  {
    name: 'Form2',
    code: `using System;
using System.Data.SQLite;
using System.IO;
using System.Windows.Forms;
using OfficeOpenXml;
using System.Globalization;
using System.Drawing; //для задания цвета

namespace WindowsFormsApplication1
{
    public partial class Form2 : Form
    {
        private string dbFilePath = "mydatabase.db";

        public class ExcelImporter
        {
            private const string ConnectionString = "Data Source=mydatabase.db;Version=3;";

            // Чтение данных из Excel-файла
            private static ExcelPackage ReadExcelFile(string filePath)
            {
                FileInfo fileInfo = new FileInfo(filePath);
                if (!fileInfo.Exists)
                    throw new FileNotFoundException($"Файл не найден: {filePath}");

                return new ExcelPackage(fileInfo);
            }

            public static void ImportProductTypes()
            {
                string filePath = "C:/Users/Дети/Desktop/Product_type_import.xlsx";

                try
                {
                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                    using (var package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        int rowCount = worksheet.Dimension?.Rows ?? 0;

                        using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                        {
                            connection.Open();

                            for (int row = 2; row <= rowCount; row++)
                            {
                                string name = worksheet.Cells[row, 1].Text;
                                string coeffText = worksheet.Cells[row, 2].Text;

                                // Удаляем пробелы и заменяем запятые на точки
                                coeffText = coeffText.Replace(" ", "").Replace(",", ".");

                                double coeff;
                                // Парсим число с учетом культуры
                                if (!double.TryParse(coeffText, NumberStyles.Any, CultureInfo.InvariantCulture, out coeff))
                                {
                                    MessageBox.Show($"Ошибка в строке {row}: '{worksheet.Cells[row, 2].Text}' - неверный коэффициент");
                                    continue;
                                }

                                using (var cmd = new SQLiteCommand(
                                    "INSERT INTO ProductType (Тип_продукции, Коэффициент_типа_продукции) VALUES (@name, @coeff)",
                                    connection))
                                {
                                    cmd.Parameters.AddWithValue("@name", name);
                                    cmd.Parameters.AddWithValue("@coeff", coeff);
                                    cmd.ExecuteNonQuery();
                                }
                            }
                        }
                    }
                    MessageBox.Show("Данные успешно импортированы!");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка импорта: {ex.Message}");
                }
            }

            public static void ImportProducts()
            {
                string filePath = "C:/Users/Дети/Desktop/Products_import.xlsx";

                try
                {
                    using (var package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        int rowCount = worksheet.Dimension?.Rows ?? 0;

                        using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                        {
                            connection.Open();

                            // Транзакция для ускорения вставки
                            using (var transaction = connection.BeginTransaction())
                            {
                                for (int row = 2; row <= rowCount; row++) // Строка 1 - заголовки
                                {
                                    string productType = worksheet.Cells[row, 1].Text;
                                    string productName = worksheet.Cells[row, 2].Text;
                                    string articleText = worksheet.Cells[row, 3].Text;
                                    string priceText = worksheet.Cells[row, 4].Text;

                                    int article;
                                    // Проверка и парсинг артикула
                                    if (!int.TryParse(articleText, out article))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: неверный артикул '{articleText}'");
                                        continue;
                                    }

                                    // Проверка и парсинг цены (с заменой разделителей)
                                    priceText = priceText.Replace(",", ".");
                                    decimal price;
                                    if (!decimal.TryParse(priceText, NumberStyles.Any, CultureInfo.InvariantCulture, out price))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: неверная цена '{priceText}'");
                                        continue;
                                    }

                                    // Вставка в БД
                                    using (var cmd = new SQLiteCommand(
                                        "INSERT INTO Products (Тип_продукции, Наименование_продукции, Артикул, Минимальная_стоимость_для_партнера) " +
                                        "VALUES (@type, @name, @article, @price)", connection))
                                    {
                                        cmd.Parameters.AddWithValue("@type", productType);
                                        cmd.Parameters.AddWithValue("@name", productName);
                                        cmd.Parameters.AddWithValue("@article", article);
                                        cmd.Parameters.AddWithValue("@price", price);
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                transaction.Commit();
                            }
                        }
                    }
                    MessageBox.Show("Данные Products успешно импортированы!");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка импорта: {ex.Message}");
                }
            }

            public static void ImportPartners()
            {
                string filePath = "C:/Users/Дети/Desktop/Partners_import.xlsx";

                try
                {
                    using (var package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        int rowCount = worksheet.Dimension?.Rows ?? 0;

                        using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                        {
                            connection.Open();

                            // Транзакция для ускорения вставки
                            using (var transaction = connection.BeginTransaction())
                            {
                                for (int row = 2; row <= rowCount; row++) // Строка 1 - заголовки
                                {
                                    string partnerType = worksheet.Cells[row, 1].Text;
                                    string partnerName = worksheet.Cells[row, 2].Text;
                                    string director = worksheet.Cells[row, 3].Text;
                                    string email = worksheet.Cells[row, 4].Text;
                                    string phone = worksheet.Cells[row, 5].Text;
                                    string address = worksheet.Cells[row, 6].Text;
                                    string inn = worksheet.Cells[row, 7].Text;
                                    string ratingText = worksheet.Cells[row, 8].Text;

                                    int rating;
                                    // Проверка рейтинга
                                    if (!int.TryParse(ratingText, out rating))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: неверный рейтинг '{ratingText}'");
                                        continue;
                                    }

                                    // Вставка в БД
                                    using (var cmd = new SQLiteCommand(
                                        "INSERT INTO Partners (" +
                                        "Тип_партнера, Наименование_партнера, Директор, " +
                                        "Электронная_почта_партнера, Телефон_партнера, " +
                                        "Юридический_адрес_партнера, ИНН, Рейтинг) " +
                                        "VALUES (@type, @name, @director, @email, @phone, @address, @inn, @rating)",
                                        connection))
                                    {
                                        cmd.Parameters.AddWithValue("@type", partnerType);
                                        cmd.Parameters.AddWithValue("@name", partnerName);
                                        cmd.Parameters.AddWithValue("@director", director);
                                        cmd.Parameters.AddWithValue("@email", email);
                                        cmd.Parameters.AddWithValue("@phone", phone);
                                        cmd.Parameters.AddWithValue("@address", address);
                                        cmd.Parameters.AddWithValue("@inn", inn);
                                        cmd.Parameters.AddWithValue("@rating", rating);
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                transaction.Commit();
                            }
                        }
                    }
                    MessageBox.Show("Данные Partners успешно импортированы!");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка импорта: {ex.Message}");
                }
            }

            public static void ImportPartnerProducts()
            {
                string filePath = "C:/Users/Дети/Desktop/Partner_products_import.xlsx";

                try
                {
                    using (var package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        int rowCount = worksheet.Dimension?.Rows ?? 0;

                        using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                        {
                            connection.Open();

                            // Транзакция для ускорения вставки
                            using (var transaction = connection.BeginTransaction())
                            {
                                for (int row = 2; row <= rowCount; row++)
                                {
                                    string productName = worksheet.Cells[row, 1].Text;
                                    string partnerName = worksheet.Cells[row, 2].Text;
                                    string quantityText = worksheet.Cells[row, 3].Text;
                                    string saleDateText = worksheet.Cells[row, 4].Text;

                                    // Проверка существования продукта и партнера
                                    if (!ProductExists(connection, productName))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: продукт '{productName}' не найден");
                                        continue;
                                    }

                                    if (!PartnerExists(connection, partnerName))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: партнер '{partnerName}' не найден");
                                        continue;
                                    }

                                    int quantity;
                                    // Проверка количества
                                    if (!int.TryParse(quantityText, out quantity))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: неверное количество '{quantityText}'");
                                        continue;
                                    }

                                    DateTime saleDate;
                                    // Проверка даты
                                    if (!DateTime.TryParse(saleDateText, out saleDate))
                                    {
                                        MessageBox.Show($"Ошибка в строке {row}: неверный формат даты '{saleDateText}'");
                                        continue;
                                    }

                                    // Вставка в БД
                                    using (var cmd = new SQLiteCommand(
                                        "INSERT INTO PartnerProducts (" +
                                        "Продукция, Наименование_партнера, Количество_продукции, Дата_продажи) " +
                                        "VALUES (@product, @partner, @quantity, @saleDate)",
                                        connection))
                                    {
                                        cmd.Parameters.AddWithValue("@product", productName);
                                        cmd.Parameters.AddWithValue("@partner", partnerName);
                                        cmd.Parameters.AddWithValue("@quantity", quantity);
                                        cmd.Parameters.AddWithValue("@saleDate", saleDate);
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                transaction.Commit();
                            }
                        }
                    }
                    MessageBox.Show("Данные PartnerProducts успешно импортированы!");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка импорта: {ex.Message}");
                }
            }

            // Проверка существования продукта
            private static bool ProductExists(SQLiteConnection connection, string productName)
            {
                using (var cmd = new SQLiteCommand(
                    "SELECT 1 FROM Products WHERE Наименование_продукции = @name",
                    connection))
                {
                    cmd.Parameters.AddWithValue("@name", productName);
                    return cmd.ExecuteScalar() != null;
                }
            }

            // Проверка существования партнера
            private static bool PartnerExists(SQLiteConnection connection, string partnerName)
            {
                using (var cmd = new SQLiteCommand(
                    "SELECT 1 FROM Partners WHERE Наименование_партнера = @name",
                    connection))
                {
                    cmd.Parameters.AddWithValue("@name", partnerName);
                    return cmd.ExecuteScalar() != null;
                }
            }

            public static void ImportMaterialTypes()
            {
                string filePath = "C:/Users/Дети/Desktop/Material_type_import.xlsx";

                try
                {
                    using (var package = new ExcelPackage(new FileInfo(filePath)))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        int rowCount = worksheet.Dimension?.Rows ?? 0;

                        using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                        {
                            connection.Open();

                            // Транзакция для ускорения вставки
                            using (var transaction = connection.BeginTransaction())
                            {
                                for (int row = 2; row <= rowCount; row++) // Строка 1 - заголовки
                                {
                                    string materialType = worksheet.Cells[row, 1].Text;
                                    string defectPercentText = worksheet.Cells[row, 2].Text;

                                    // Заменяем запятые на точки для корректного парсинга
                                    defectPercentText = defectPercentText.Replace(",", ".");

                                    // Вставка в БД
                                    using (var cmd = new SQLiteCommand(
                                        "INSERT INTO MaterialType (Тип_материала, Процент_брака_материала) " +
                                        "VALUES (@type, @percent)",
                                        connection))
                                    {
                                        cmd.Parameters.AddWithValue("@type", materialType);
                                        cmd.Parameters.AddWithValue("@percent", defectPercentText);
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                transaction.Commit();
                            }
                        }
                    }
                    MessageBox.Show("Данные MaterialType успешно импортированы!");
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка импорта: {ex.Message}");
                }
            }
        }


        public Form2()
        {
            InitializeComponent();
        }

        private void button6_Click(object sender, EventArgs e)
        {

        }

        private void button7_Click(object sender, EventArgs e)
        {
            DialogResult result;
            result = MessageBox.Show("Вы действительно хотите закрыть приложение?",
                    "Закрытие приложения", MessageBoxButtons.YesNo, MessageBoxIcon.Asterisk);
            if (result == DialogResult.Yes)
            {
                Application.Exit();
            }
        }

        private void Form2_Load(object sender, EventArgs e)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            CreateDatabaseIfNotExists();




            button1.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            button2.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            button3.BackColor = ColorTranslator.FromHtml("#67BA80");
            button5.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            button4.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            button7.BackColor = ColorTranslator.FromHtml("#67BA80");

        }

        private void CreateDatabaseIfNotExists()
        {
            if (!File.Exists(dbFilePath))
            {
                SQLiteConnection.CreateFile(dbFilePath);
                CreateTables();
                MessageBox.Show("База данных и таблица Users созданы.", "Информация");
                ExcelImporter.ImportProductTypes();
                ExcelImporter.ImportProducts();
                ExcelImporter.ImportPartners();
                ExcelImporter.ImportPartnerProducts();
                ExcelImporter.ImportMaterialTypes();
            }
        }

        private void CreateTables()
        {
            using (SQLiteConnection connection = new SQLiteConnection($"Data Source={dbFilePath};Version=3;"))
            {
                connection.Open();

                string sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS Users (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Username VARCHAR(50) NOT NULL,
                        Email VARCHAR(100) NULL
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }


                sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS Partners (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Тип_партнера TEXT NOT NULL,
                        Наименование_партнера TEXT NOT NULL UNIQUE,
                        Директор TEXT NOT NULL,
                        Электронная_почта_партнера TEXT NOT NULL,
                        Телефон_партнера TEXT NOT NULL,
                        Юридический_адрес_партнера TEXT NOT NULL,
                        ИНН TEXT NOT NULL UNIQUE,
                        Рейтинг INTEGER NOT NULL
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }


                sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS ProductType (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Тип_продукции TEXT NOT NULL UNIQUE,
                        Коэффициент_типа_продукции REAL NOT NULL
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }


                sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS Products (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Тип_продукции TEXT NOT NULL,
                        Наименование_продукции TEXT NOT NULL,
                        Артикул INTEGER NOT NULL UNIQUE,
                        Минимальная_стоимость_для_партнера REAL NOT NULL,
                        FOREIGN KEY(Тип_продукции) REFERENCES ProductType(Тип_продукции)
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }


                sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS PartnerProducts (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Продукция TEXT NOT NULL,
                        Наименование_партнера TEXT NOT NULL,
                        Количество_продукции INTEGER NOT NULL,
                        Дата_продажи DATETIME NOT NULL,
                        FOREIGN KEY (Продукция) REFERENCES Products(Наименование_продукции),
                        FOREIGN KEY (Наименование_партнера) REFERENCES Partners(Наименование_партнера)
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }


                sqlCreateTable = @"
                    CREATE TABLE IF NOT EXISTS MaterialType (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Тип_материала TEXT NOT NULL,
                        Процент_брака_материала REAL NOT NULL
                    );";

                using (SQLiteCommand command = new SQLiteCommand(sqlCreateTable, connection))
                {
                    command.ExecuteNonQuery();
                }
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Form3 fr3 = new Form3();
            this.Hide();
            fr3.Show();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            Products pr = new Products();
            this.Hide();
            pr.Show();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            Partners pr = new Partners();
            this.Hide();
            pr.Show();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            PartnersProduct pr = new PartnersProduct();
            this.Hide();
            pr.Show();
        }

        private void button5_Click(object sender, EventArgs e)
        {
            MaterialType mt = new MaterialType();
            this.Hide();
            mt.Show();
        }


    }
}
`
  },
  {
    name: 'Partners',
    code: `using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SQLite;
using System.Windows.Forms;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using System.IO;
using System.Net;
using System.Windows.Media;

namespace WindowsFormsApplication1
{
    public partial class Partners : Form
    {
        public Partners()
        {
            InitializeComponent();
        }


        private void button1_Click(object sender, EventArgs e)
        {
            Form2 fr2 = new Form2();
            this.Hide();
            fr2.Show();
        }

        private DataTable GetDataFromDatabase(string query)
        {
            var dataTable = new DataTable();

            using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
            {
                connection.Open();
                using (var adapter = new SQLiteDataAdapter(query, connection))
                {
                    adapter.Fill(dataTable);
                }
            }

            return dataTable;
        }

        private void Partners_Load(object sender, EventArgs e)
        {
            this.Size = new Size(1094, 429);
            rtbPartnerInfo.ReadOnly = true;
            rtbPartnerInfo.ScrollBars = RichTextBoxScrollBars.Vertical;
            rtbPartnerInfo.Font = new Font("Segoe UI", 10);

            try
            {
                string query = "SELECT * FROM Partners";
                dataGridView1.DataSource = GetDataFromDatabase(query);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка загрузки: {ex.Message}");
            }
            dataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            button1.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            button2.BackColor = ColorTranslator.FromHtml("#67BA80");
            btnAdd.BackColor = ColorTranslator.FromHtml("#67BA80");
            btnChange.BackColor = ColorTranslator.FromHtml("#67BA80");
            rtbPartnerInfo.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            btnHistory.BackColor = ColorTranslator.FromHtml("#67BA80");
        }

        private void button2_Click(object sender, EventArgs e)
        {
            this.Size = new Size(1094, 700);

            try
            {
                rtbPartnerInfo.Clear();

                // Получаем данные о партнерах
                DataTable partnersData = GetPartnersWithDiscounts();

                // Формируем карточки для каждого партнера
                foreach (DataRow row in partnersData.Rows)
                {
                    AddPartnerCard(
                        row["Тип_партнера"].ToString(),
                        row["Наименование_партнера"].ToString(),
                        row["Директор"].ToString(),
                        row["Телефон_партнера"].ToString(),
                        row["Рейтинг"].ToString(),
                        row["Скидка"].ToString()
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Ошибка: " + ex.Message);
            }
        }

        private void AddPartnerCard(string type, string name, string director, string phone, string rating, string discount)
        {
            // Форматируем телефон
            phone = FormatPhone(phone);

            // Определяем максимальную длину строки с наименованием
            int maxNameLength = 70; // Максимальная длина строки с наименованием

            string header = type + " | " + name;
            header = header.PadRight(maxNameLength) + discount;

            // Основная информация
            rtbPartnerInfo.SelectionFont = new Font("Arial", 12, FontStyle.Regular);
            rtbPartnerInfo.AppendText(header + "\\n");
            rtbPartnerInfo.AppendText(director + "\\n");
            rtbPartnerInfo.AppendText(phone + "\\n");
            rtbPartnerInfo.AppendText("Рейтинг: " + rating + "\\n");

            // Добавляем отступ между карточками
            rtbPartnerInfo.AppendText("\\n");

            // Добавляем разделитель (кроме последней карточки)
            rtbPartnerInfo.AppendText(new string('-', 100) + "\\n\\n");
        }

        // Получение данных о партнерах с расчетом скидок
        private DataTable GetPartnersWithDiscounts()
        {
            DataTable dt = new DataTable();

            using (SQLiteConnection conn = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
            {
                conn.Open();
                string query = @"
                SELECT
                    p.Тип_партнера,
                    p.Наименование_партнера,
                    p.Директор,
                    p.Телефон_партнера,
                    p.Рейтинг,
                    CASE
                        WHEN IFNULL((SELECT SUM(Количество_продукции) FROM PartnerProducts
                                   WHERE Наименование_партнера = p.Наименование_партнера), 0) >= 300000 THEN '15%'
                        WHEN IFNULL((SELECT SUM(Количество_продукции) FROM PartnerProducts
                                   WHERE Наименование_партнера = p.Наименование_партнера), 0) >= 50000 THEN '10%'
                        WHEN IFNULL((SELECT SUM(Количество_продукции) FROM PartnerProducts
                                   WHERE Наименование_партнера = p.Наименование_партнера), 0) >= 10000 THEN '5%'
                        ELSE '0%'
                    END AS 'Скидка'
                FROM Partners p
                ORDER BY p.Рейтинг DESC";

                using (SQLiteDataAdapter da = new SQLiteDataAdapter(query, conn))
                {
                    da.Fill(dt);
                }
            }

            return dt;
        }

        private string FormatPhone(string phone)
        {
            // Оставляем только цифры
            phone = new string(phone.Where(char.IsDigit).ToArray());

            // Преобразуем номера, начинающиеся с 8
            if (phone.Length == 11 && phone.StartsWith("8"))
                phone = "7" + phone.Substring(1);

            // Форматируем стандартные российские номера
            if (phone.Length == 10)
                return "+7 " + phone.Substring(0, 3) + " " + phone.Substring(3, 3) + " " + phone.Substring(6, 2) + " " + phone.Substring(8);

            if (phone.Length == 11)
                return "+" + phone.Substring(0, 1) + " " + phone.Substring(1, 3) + " " + phone.Substring(4, 3) + " " + phone.Substring(7, 2) + " " + phone.Substring(9);

            return phone; // Возвращаем как есть, если формат неизвестен
        }

        private void btnAdd_Click(object sender, EventArgs e)
        {
            string str1, str2, str3, str4, str5, str6, str7, str8;
            DialogResult r ;

            AddPartners addPart = new AddPartners();
            addPart.ShowDialog();

            str1 = addPart.cmbType.Text;
            str2 = addPart.txtName.Text;
            str3 = addPart.txtDirector.Text;
            str4 = addPart.txtEmail.Text;
            str5 = addPart.maskTxtNumber.Text;
            str6 = addPart.txtAdress.Text;
            str7 = addPart.txtInn.Text;
            str8 = addPart.numericTxtReyting.Text;
            r = addPart.DialogResult;

            addPart.Close();
            if (r == DialogResult.OK)
            {
                using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(
                                            "INSERT INTO Partners (" +
                                            "Тип_партнера, Наименование_партнера, Директор, " +
                                            "Электронная_почта_партнера, Телефон_партнера, " +
                                            "Юридический_адрес_партнера, ИНН, Рейтинг) " +
                                            "VALUES (@type, @name, @director, @email, @phone, @address, @inn, @rating)",
                                            connection))
                    {
                        cmd.Parameters.AddWithValue("@type", str1);
                        cmd.Parameters.AddWithValue("@name", str2);
                        cmd.Parameters.AddWithValue("@director", str3);
                        cmd.Parameters.AddWithValue("@email", str4);
                        cmd.Parameters.AddWithValue("@phone", str5);
                        cmd.Parameters.AddWithValue("@address", str6);
                        cmd.Parameters.AddWithValue("@inn", str7);
                        cmd.Parameters.AddWithValue("@rating", str8);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Запись успешно добавлена!");
                    //обновление таблицы
                    string query = "SELECT * FROM Partners";
                    dataGridView1.DataSource = GetDataFromDatabase(query);

                    //обновление карточек
                    DataTable partnersData = GetPartnersWithDiscounts();

                    // Формируем карточки для каждого партнера
                    foreach (DataRow row in partnersData.Rows)
                    {
                        AddPartnerCard(
                            row["Тип_партнера"].ToString(),
                            row["Наименование_партнера"].ToString(),
                            row["Директор"].ToString(),
                            row["Телефон_партнера"].ToString(),
                            row["Рейтинг"].ToString(),
                            row["Скидка"].ToString()
                        );
                    }
                }
                return;
            }
            else
            {
                MessageBox.Show("Отмена добавления!");
            }
        }

        private void btnChange_Click(object sender, EventArgs e)
        {
            var id = dataGridView1.CurrentRow.Cells[0].Value;
            string str1, str2, str3, str4, str5, str6, str7, str8;
            DialogResult r;
            AddPartners addPart = new AddPartners();
            if (dataGridView1.SelectedRows.Count == 0)
            {
                MessageBox.Show("Выберите партнера из таблицы и повторно нажмите кнопку!", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            addPart.Text = "Изменение данных о партнера";
            addPart.btnAdd.Text = "Изменить";

            addPart.cmbType.Text = "";
            addPart.txtName.Text = "";
            addPart.txtDirector.Text = "";
            addPart.txtEmail.Text = "";
            addPart.maskTxtNumber.Text = "";
            addPart.txtAdress.Text = "";
            addPart.txtInn.Text = "";
            addPart.numericTxtReyting.Text = "";

            addPart.cmbType.Text = dataGridView1.CurrentRow.Cells[1].Value.ToString();
            addPart.txtName.Text = dataGridView1.CurrentRow.Cells[2].Value.ToString();
            addPart.txtDirector.Text = dataGridView1.CurrentRow.Cells[3].Value.ToString();
            addPart.txtEmail.Text = dataGridView1.CurrentRow.Cells[4].Value.ToString();
            addPart.maskTxtNumber.Text = dataGridView1.CurrentRow.Cells[5].Value.ToString();
            addPart.txtAdress.Text = dataGridView1.CurrentRow.Cells[6].Value.ToString();
            addPart.txtInn.Text = dataGridView1.CurrentRow.Cells[7].Value.ToString();
            addPart.numericTxtReyting.Text = dataGridView1.CurrentRow.Cells[8].Value.ToString();

            addPart.ShowDialog();

            str1 = addPart.cmbType.Text;
            str2 = addPart.txtName.Text;
            str3 = addPart.txtDirector.Text;
            str4 = addPart.txtEmail.Text;
            str5 = addPart.maskTxtNumber.Text;
            str6 = addPart.txtAdress.Text;
            str7 = addPart.txtInn.Text;
            str8 = addPart.numericTxtReyting.Text;
            r = addPart.DialogResult;

            addPart.Close();
            if (r == DialogResult.OK)
            {
                using (var connection = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(
                                            "UPDATE [Partners] SET [Тип_партнера] = @type, [Наименование_партнера] = @name, [Директор] = @director, " +
                                            "[Электронная_почта_партнера] = @email, [Телефон_партнера] = @phone, " +
                                            "[Юридический_адрес_партнера] = @address, [ИНН] = @inn, [Рейтинг] = @rating WHERE [ID] = @id",
                                            connection))
                    {
                        cmd.Parameters.AddWithValue("@type", str1);
                        cmd.Parameters.AddWithValue("@name", str2);
                        cmd.Parameters.AddWithValue("@director", str3);
                        cmd.Parameters.AddWithValue("@email", str4);
                        cmd.Parameters.AddWithValue("@phone", str5);
                        cmd.Parameters.AddWithValue("@address", str6);
                        cmd.Parameters.AddWithValue("@inn", str7);
                        cmd.Parameters.AddWithValue("@rating", str8);
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.ExecuteNonQuery();
                    }
                    MessageBox.Show("Запись успешно изменена!");
                    //обновление таблицы
                    string query = "SELECT * FROM Partners";
                    dataGridView1.DataSource = GetDataFromDatabase(query);

                    //обновление карточек
                    DataTable partnersData = GetPartnersWithDiscounts();

                    // Формируем карточки для каждого партнера
                    foreach (DataRow row in partnersData.Rows)
                    {
                        AddPartnerCard(
                            row["Тип_партнера"].ToString(),
                            row["Наименование_партнера"].ToString(),
                            row["Директор"].ToString(),
                            row["Телефон_партнера"].ToString(),
                            row["Рейтинг"].ToString(),
                            row["Скидка"].ToString()
                        );
                    }
                }
                return;
            }
            else
            {
                MessageBox.Show("Отмена изменения!");
            }
        }

        public string selectedPartner;


    }
}
`
  },
  {
    name: 'HELPER',
    code: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SQLite;
using System.Windows.Forms;

namespace WindowsFormsApplication1
{
    public static class HELPER
    {
        // Для заполнения Типами партнеров списка на форме добавления/редактирования партнеров
        public static void LoadPartnerTypes(ComboBox comboBox)
        {
            try
            {
                comboBox.Items.Clear(); // Очищаем существующие элементы

                using (SQLiteConnection conn = new SQLiteConnection("Data Source=mydatabase.db;Version=3;"))
                {
                    conn.Open();

                    // Запрос для получения уникальных типов партнеров
                    string query = "SELECT DISTINCT Тип_партнера FROM Partners ORDER BY Тип_партнера";

                    using (SQLiteCommand cmd = new SQLiteCommand(query, conn))
                    using (SQLiteDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            // Добавляем каждый тип в ComboBox
                            comboBox.Items.Add(reader["Тип_партнера"].ToString());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Ошибка загрузки типов партнеров: " + ex.Message);
            }
        }
    }
}

`
  },
  {
    name: 'AddPartners',
    code: `using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SQLite;

namespace WindowsFormsApplication1
{
    public partial class AddPartners : Form
    {
        public AddPartners()
        {
            InitializeComponent();
        }

        private void AddPartners_Load(object sender, EventArgs e)
        {
            btnAdd.BackColor = ColorTranslator.FromHtml("#67BA80");
            btnClose.BackColor = ColorTranslator.FromHtml("#F4E8D3");
            HELPER.LoadPartnerTypes(cmbType);
        }

        private void btnAdd_Click(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.OK;
            this.Close();
        }

        private void btnClose_Click(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.Cancel;
            this.Close();
        }
    }
}

`
  },

]

const selectedFile = ref(files[0])
const showS3 = ref(false)
const basefor4 = 'https://minio.tsukawa.ru/exam/DEMO/BD.db'
const basefor3 = 'https://minio.tsukawa.ru/exam/DEMO/DB_test.db'// <-- замените на актуальное имя файла
</script>

<template>
  <div class="cheatsheet">

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
        </ul>
      </div>

      <div class="code-viewer">
        <CodeComponent v-if="!showS3" :code="selectedFile.code" />
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
