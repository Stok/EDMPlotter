using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.IO;
using Jitbit.Utils;

namespace SharedCode
{
    public class DataSet
    {

        public List<DataPoint> data;

        public DataSet()
        {
            data = new List<DataPoint>();
        }

        public int Length
        {
            get { return data.Count; }
        }

        public void Add(DataPoint p)
        {
            data.Add(p);
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(data.ToArray());
        }

        public void SaveJson(string path)
        {
            //For writing to JSON
            using (FileStream fs = File.Open(@"" + path, FileMode.CreateNew))
            using (StreamWriter sw = new StreamWriter(fs))
            using (JsonWriter jw = new JsonTextWriter(sw))
            {
                jw.Formatting = Formatting.Indented;

                JsonSerializer serializer = new JsonSerializer();
                serializer.Serialize(jw, this);
            }
        }

        public void SaveCSV(string path)
        {
            CsvExport csv = new CsvExport();
            for (int i = 0; i < this.Length; i++)
            {
                csv.AddRow();
                csv["x_val"] = data[i].x_val;
                csv["y_val"] = data[i].y_val;
            }
            csv.ExportToFile(@"" + path);
        }

    }
}