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

        public List<DataPoint> dataSet;

        public DataSet()
        {
            dataSet = new List<DataPoint>();
        }

        public int Length
        {
            get { return dataSet.Count; }
        }

        public void Add(DataPoint p)
        {
            dataSet.Add(p);
        }

        //Because my plot can only handle 2 dimensions (at the moment), have a cheezy conversion here. Fix later.
        struct twoDData {
            public double x_val;
            public double y_val;
            public twoDData(double x, double y)
            {
                x_val = x;
                y_val = y;
            }
        };
        List<twoDData> reducedData;
        public string ToJson()
        {
            reducedData = new List<twoDData>();
            foreach(DataPoint d in dataSet)
            {
                reducedData.Add(new twoDData(d.Values[0], d.Values[1]));
            }
            return JsonConvert.SerializeObject(reducedData.ToArray());
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
            for (int i = 0; i < Length; i++)
            {
                csv.AddRow();
                for(int j = 0; j < dataSet[0].Dimensions(); j++)
                {
                    csv[dataSet[i].Names[j]] = dataSet[i].Values[j];
                }
            }
            csv.ExportToFile(@"" + path);
        }

    }
}