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

        public List<DataPoint> Points;

        public DataSet()
        {
            Points = new List<DataPoint>();
        }

        public int Length
        {
            get { return Points.Count; }
        }

        public void Add(DataPoint p)
        {
            Points.Add(p);
        }

        public string ToJson()
        {
            string allData = "";
            for(int i = 0; i < Length; i++)
            {
                allData+= Points[i].ToJson();
                if (i < Length - 1)
                {
                    allData += ", ";
                }
            }
            allData = "[" + allData + "]";
            return allData;
        }

        public void SaveCSV(string path)
        {
            CsvExport csv = new CsvExport();
            for (int i = 0; i < Length; i++)
            {
                csv.AddRow();
                foreach(KeyValuePair<string, double> p in Points[i].kvPairs)
                {
                    csv[p.Key] = p.Value;
                }
            }
            csv.ExportToFile(@"" + path);
        }

    }
}