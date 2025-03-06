import psycopg2

conn = psycopg2.connect(database="postgres", user="postgres", password="ADAMapDev", host="10.96.32.35", port=5432)

cur = conn.cursor()

'''
example of creating a table

cur.execute("""CREATE TABLE IF NOT EXISTS person (
            id INT PRIMARY KEY,
            name VARCHAR(255),
            age INT,
            gender CHAR
);
""")

do all commands before the commit

conn.commit()
'''

cur.close()
conn.close()