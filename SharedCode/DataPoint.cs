using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace SharedCode
{
    public class DataPoint
    {
        public List<string> Names;
        public List<double> Values;
        public DataPoint(string xnam, double x, string ynam, double y)
        {
            Names = new List<string>();
            Values = new List<double>();
            Names.Add(xnam);
            Values.Add(x);
            Names.Add(ynam);
            Values.Add(y);
        }

        public DataPoint(string[] names, double[] vals)
        {
            Names = new List<string>();
            Values = new List<double>();
            for (int i = 0; i < names.Length; i++)
            {
                Names.Add(names[i]);
                Values.Add(vals[i]);
            }
        }

        public int Dimensions()
        {
            return Values.Count;
        }

        struct twoDData { public double x_val; public double y_val; };
        public string To2DJson()
        {
            twoDData d = new twoDData();
            d.x_val = Values[0];
            d.y_val = Values[1];
            return JsonConvert.SerializeObject(d);
        }
    }

}